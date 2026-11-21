// Shared design system (ARCHITECTURE.md §3). Exact design markup and class names,
// typed props, no data fetching, no user-facing literals (all copy via props).
export { Button, ButtonLink, ButtonAnchor, ButtonRow, PlayButton, commonBtnClass } from './primitives/Button';
export type { ButtonVariant, ButtonSize } from './primitives/Button';
export { SectionHeading } from './primitives/SectionHeading';
export type { SectionHeadingProps } from './primitives/SectionHeading';
export { Card, Note } from './primitives/Card';
export type { CardProps, CardTone } from './primitives/Card';
export { Badge } from './primitives/Badge';
export type { BadgeKind, BadgeProps } from './primitives/Badge';
export { Chip, ChipGroup } from './primitives/Chip';
export type { ChipProps, ChipGroupProps } from './primitives/Chip';
export { ResultBox } from './primitives/ResultBox';
export type { ResultKind, ResultBoxProps } from './primitives/ResultBox';
export { Field, Input, Textarea, Select } from './primitives/Field';
export type { FieldProps, SelectOption, SelectProps } from './primitives/Field';
export { FlowSteps, Stepper, Timeline } from './primitives/Steps';
export type { FlowStep, FlowStepsProps, StepperProps, TimelineItem } from './primitives/Steps';
export { Table } from './primitives/Table';
export type { TableColumn, TableProps } from './primitives/Table';
export { Accordion } from './primitives/Accordion';
export type { AccordionItem, AccordionProps } from './primitives/Accordion';
export { Pagination } from './primitives/Pagination';
export type { PaginationLabels, PaginationProps } from './primitives/Pagination';
export { Slider } from './primitives/Slider';
export type { SliderProps } from './primitives/Slider';
export { ProgressBar } from './primitives/ProgressBar';
export type { ProgressBarProps } from './primitives/ProgressBar';
export { BreadcrumbBanner } from './chrome/BreadcrumbBanner';
export type { BreadcrumbBannerProps, Crumb } from './chrome/BreadcrumbBanner';
export { CampaignCard } from './blocks/CampaignCard';
export type { CampaignCardProps } from './blocks/CampaignCard';
// Chrome (Step 4): public header + mega menus, language switcher, footer, back-to-top.
export { PublicHeader } from './chrome/PublicHeader';
export type { PublicHeaderProps } from './chrome/PublicHeader';
export { MegaMenu } from './chrome/MegaMenu';
export { LanguageSelect } from './chrome/LanguageSelect';
export type { LanguageOption, LanguageSelectProps } from './chrome/LanguageSelect';
export { Footer } from './chrome/Footer';
export type { FooterProps } from './chrome/Footer';
export { ScrollProgressButton } from './chrome/ScrollProgressButton';
export { ChromeAnchor } from './chrome/ChromeAnchor';
// App shell (Step 4): portal + admin console.
export { AppShell } from './shell/AppShell';
export type { AppShellProps, ShellCrumb, ShellLink } from './shell/AppShell';
// Loading / empty / error states.
export { EmptyState, ErrorState, LoadingState } from './states/QueryStates';
// Content blocks (Step 5): CMS sections render these with resolved copy and media.
export { HeadingRow } from './primitives/HeadingRow';
export type { HeadingRowProps } from './primitives/HeadingRow';
export { HeroSlider } from './blocks/HeroSlider';
export type { HeroSlide, HeroSliderProps } from './blocks/HeroSlider';
export { IxCardItem } from './blocks/IxCardItem';
export type { IxCardItemProps, IxCardVariant } from './blocks/IxCardItem';
export {
  BlogCard,
  CategoryItem,
  CharterSection,
  CounterItem,
  DonorCard,
  EventCard,
  PersonCard,
  ServiceItem,
  TestimonialCard,
} from './blocks/ContentCards';
export type { CardImage } from './blocks/ContentCards';
export { GalleryItem, Lightbox } from './blocks/Gallery';
export type { LightboxLabels } from './blocks/Gallery';
export { CommitteeCard } from './blocks/CommitteeCard';
export type { CommitteeCardProps } from './blocks/CommitteeCard';
export { BRAND_ARROWS_MIN_WIDTH, SLIDER_CONFIGS } from './blocks/sliderConfigs';
export { CampaignGallery } from './blocks/CampaignGallery';
export type { CampaignGalleryProps } from './blocks/CampaignGallery';
