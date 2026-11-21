import type { Delivery, EmailTemplate } from '@/domain/entities/admin.types';
import { AdminError, unknownVariables } from '@/domain/rules/admin';
import { mockResponse } from '@/infrastructure/api/mock';
import { nowStamp, recordAudit, systemMockStore, today } from './adminMockStore';

// System (backend §4.9 notifications): email templates (variables must resolve before sending) and
// the delivery log (queued sends, retries; recipients are record numbers — no personal data is
// logged). Contract for INT-4 + the mock.
export interface SystemRepository {
  templates(): Promise<EmailTemplate[]>;
  saveTemplate(input: { id: string; subject: string; body: string }): Promise<EmailTemplate>;
  /** sends the template to the signed-in admin (as a test) */
  sendTest(input: { id: string; subject: string; body: string }): Promise<Delivery>;
  deliveries(): Promise<Delivery[]>;
}

const store = systemMockStore;

function checkTemplate(id: string, subject: string, body: string): EmailTemplate {
  const template = store.read().templates.find((t) => t.id === id);
  if (!template) throw new AdminError('NOT_FOUND');
  if (!subject.trim()) throw new AdminError('REQUIRED');
  if (unknownVariables(`${subject}\n${body}`, template.variables).length) throw new AdminError('UNKNOWN_VARIABLE');
  return template;
}

export const mockSystemRepository: SystemRepository = {
  templates: () => mockResponse(() => store.read().templates),
  saveTemplate: ({ id, subject, body }) =>
    mockResponse(() => {
      const template = checkTemplate(id, subject, body);
      const saved: EmailTemplate = { ...template, subject: subject.trim(), body, editedOn: today() };
      store.mutate((db) => {
        const index = db.templates.findIndex((t) => t.id === id);
        db.templates[index] = saved;
      });
      recordAudit({ action: 'email_template.updated', entity: `Email template · ${template.name}`, before: template.subject, after: saved.subject });
      return saved;
    }),
  sendTest: ({ id, subject, body }) =>
    mockResponse(() => {
      const template = checkTemplate(id, subject, body);
      const delivery: Delivery = { id: `dl-${Date.now().toString(36)}`, sentAt: nowStamp(), templateId: id, recipient: { type: 'TEST' }, status: 'DELIVERED', attempts: 1 };
      store.mutate((db) => void db.deliveries.unshift(delivery));
      recordAudit({ action: 'email_template.test_sent', entity: `Email template · ${template.name}` });
      return delivery;
    }),
  deliveries: () => mockResponse(() => store.read().deliveries),
};

/** The system repository of the configured data source (INT-4 adds the HTTP implementation). */
export const systemRepository: SystemRepository = mockSystemRepository;
