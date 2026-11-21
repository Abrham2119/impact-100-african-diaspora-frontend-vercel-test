import { useId, useState, type ReactNode } from 'react';
import { usePostComment, useComments } from '@/features/governance/hooks/usePortalGovernance';
import { useT } from '@/i18n/useT';

// A discussion thread (portal_vote / portal_amendment .dc.html): comments with initials, name and
// level badge, then "Add a comment" + "post comment" (stored in the mock store). `extra` sits beside
// the button (the vote page's "Open full proposal →").
const MAX_COMMENT = 2000;
const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((w) => w[0] ?? '')
    .join('')
    .replace(/\./g, '')
    .toUpperCase()
    .slice(0, 2);

export function Discussion({ targetId, heading = true, extra }: { targetId: string; heading?: boolean; extra?: ReactNode }) {
  const t = useT('portal');
  const id = useId();
  const { data: comments } = useComments(targetId);
  const post = usePostComment();
  const [text, setText] = useState('');
  const send = () => {
    if (!text.trim()) return;
    post.mutate({ targetId, text }, { onSuccess: () => setText('') });
  };

  return (
    <>
      {heading && <h4 className="ixd_discussion">{t('vote.discussion')}</h4>}
      {(comments ?? []).map((comment) => (
        <div key={comment.id} className="ix_comment">
          <div className="ix_avatar">{initials(comment.authorName)}</div>
          <div>
            <b>{comment.authorName}</b> <span className="ix_badge">{comment.authorLevel}</span>
            <p className="ixd_mt4">{comment.text}</p>
          </div>
        </div>
      ))}
      <div className="contact_input">
        <label htmlFor={id}>{t('vote.addComment')}</label>
        <textarea id={id} rows={3} maxLength={MAX_COMMENT} placeholder={t('vote.commentPlaceholder')} value={text} onChange={(e) => setText(e.target.value)} />
      </div>
      <div className="ix_btn_row">
        <button type="button" className="common_btn ix_btn_sm" disabled={post.isPending} onClick={send}>
          {t('vote.postComment')}
        </button>
        {extra}
      </div>
    </>
  );
}
