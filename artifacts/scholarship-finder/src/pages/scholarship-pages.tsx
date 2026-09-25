import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import {
  ArrowRight,
  Bell,
  Bookmark,
  BookmarkCheck,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronRight,
  CircleAlert,
  CircleDollarSign,
  ExternalLink,
  FileCheck2,
  GraduationCap,
  LayoutDashboard,
  ListFilter,
  LoaderCircle,
  MapPin,
  Menu,
  PencilLine,
  Search,
  Settings,
  SlidersHorizontal,
  Sparkles,
  Target,
  UserRound,
  X,
} from 'lucide-react';
import {
  getGetDashboardQueryKey,
  getGetProfileQueryKey,
  getGetRecommendationsQueryKey,
  getGetScholarshipQueryKey,
  getListApplicationsQueryKey,
  getListNotificationsQueryKey,
  getListScholarshipsQueryKey,
  getListSavedScholarshipsQueryKey,
  type Application,
  type Recommendation,
  type Scholarship,
  useCreateApplication,
  useGetDashboard,
  useGetProfile,
  useGetRecommendations,
  useGetScholarship,
  useListApplications,
  useListNotifications,
  useListSavedScholarships,
  useListScholarships,
  useMarkNotificationRead,
  useSaveScholarship,
  useUnsaveScholarship,
  useUpdateApplication,
  useUpdateProfile,
} from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const nav = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/search', label: 'Find scholarships', icon: Search },
  { href: '/recommendations', label: 'For you', icon: Sparkles },
  { href: '/saved', label: 'Saved', icon: Bookmark },
  { href: '/applications', label: 'Applications', icon: FileCheck2 },
];
const secondaryNav = [
  { href: '/profile', label: 'My profile', icon: UserRound },
  { href: '/notifications', label: 'Notifications', icon: Bell },
  { href: '/settings', label: 'Settings', icon: Settings },
];

function initials(name?: string) {
  return (name || 'Student').split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
}
function formatMoney(amount?: string, currency?: string) {
  if (!amount) return 'Award varies';
  if (amount.startsWith('₹') || amount.startsWith('$')) return amount;
  return `${currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency || ''}${amount}`;
}
function dateLabel(value?: string) {
  if (!value) return 'Date not listed';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
function daysLeft(value?: string) {
  if (!value) return '';
  const difference = Math.ceil((new Date(value).getTime() - Date.now()) / 86400000);
  if (difference < 0) return 'Closed';
  if (difference === 0) return 'Due today';
  return `${difference} days left`;
}

function LoadingState({ label = 'Finding your opportunities' }: { label?: string }) {
  return <div className="min-h-[280px] grid place-items-center rounded-2xl border border-border bg-card/70">
    <div className="text-center"><div className="mx-auto mb-3 h-10 w-56 shimmer rounded-lg" /><p className="text-sm text-muted-foreground">{label}</p></div>
  </div>;
}
function ErrorState({ onRetry }: { onRetry: () => void }) {
  return <div className="rounded-2xl border border-accent/30 bg-accent/5 p-10 text-center"><CircleAlert className="mx-auto mb-3 text-accent" /><h3 className="font-display text-lg font-semibold">We couldn’t load this just yet</h3><p className="mt-1 text-sm text-muted-foreground">Give it another try — your saved work is safe.</p><Button data-testid="button-retry" onClick={onRetry} className="mt-5" variant="outline">Try again</Button></div>;
}
function EmptyState({ title, detail, action }: { title: string; detail: string; action?: React.ReactNode }) {
  return <div className="rounded-2xl border border-dashed border-border bg-card/50 px-6 py-14 text-center"><div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-secondary text-primary"><Sparkles size={21} /></div><h3 className="font-display text-lg font-semibold">{title}</h3><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">{detail}</p>{action}</div>;
}

function Shell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const profileQuery = useGetProfile({ query: { queryKey: getGetProfileQueryKey(), staleTime: 30000 } });
  const profile = profileQuery.data;
  return <div className="app-shell bg-background text-foreground">
    <aside className={`fixed inset-y-0 left-0 z-40 flex w-[250px] flex-col bg-sidebar px-4 py-5 text-sidebar-foreground transition-transform md:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
       <div className="flex items-center justify-between px-2"><Link data-testid="link-brand" href="/" className="flex items-center gap-2.5"><span className="grid h-9 w-9 place-items-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground"><GraduationCap size={21} /></span><span className="font-display text-[19px] font-bold tracking-tight">Scholarship <span className="text-sidebar-primary">Finder</span></span></Link><button data-testid="button-close-menu" className="md:hidden" onClick={() => setMobileOpen(false)}><X size={18} /></button></div>
      <div className="mt-10 flex-1">
        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.16em] text-sidebar-foreground/50">Your workspace</p>
        <nav className="space-y-1">{nav.map(({ href, label, icon: Icon }) => <Link data-testid={`link-nav-${label.toLowerCase().replaceAll(' ', '-')}`} key={href} href={href} onClick={() => setMobileOpen(false)} className={`group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-colors ${location === href ? 'bg-sidebar-primary text-sidebar-primary-foreground font-semibold' : 'text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-foreground'}`}><span className="flex items-center gap-3"><Icon size={17} /><span>{label}</span></span>{location === href && <ChevronRight size={15} />}</Link>)}</nav>
        <p className="mb-3 mt-9 px-3 text-[10px] font-bold uppercase tracking-[.16em] text-sidebar-foreground/50">Account</p>
        <nav className="space-y-1">{secondaryNav.map(({ href, label, icon: Icon }) => <Link data-testid={`link-nav-${label.toLowerCase().replaceAll(' ', '-')}`} key={href} href={href} onClick={() => setMobileOpen(false)} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${location === href ? 'bg-sidebar-accent text-sidebar-foreground' : 'text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-foreground'}`}><Icon size={17} /><span>{label}</span>{label === 'Notifications' && <UnreadDot />}</Link>)}</nav>
      </div>
      <Link data-testid="link-profile-card" href="/profile" className="rounded-2xl border border-sidebar-border bg-sidebar-accent/50 p-3 transition-colors hover:bg-sidebar-accent"><div className="flex items-center gap-3"><div className="grid h-9 w-9 place-items-center rounded-full bg-sidebar-primary font-display text-sm font-bold text-sidebar-primary-foreground">{initials(profile?.name)}</div><div className="min-w-0"><p className="truncate text-sm font-semibold">{profile?.name || 'Your profile'}</p><p className="truncate text-xs text-sidebar-foreground/60">{profile ? `${profile.completion}% complete` : 'Set up your profile'}</p></div><ChevronRight size={15} className="ml-auto text-sidebar-foreground/50" /></div></Link>
    </aside>
    {mobileOpen && <button data-testid="button-overlay" className="fixed inset-0 z-30 bg-sidebar/40 md:hidden" onClick={() => setMobileOpen(false)} aria-label="Close menu" />}
     <main className="md:pl-[250px]"><header className="sticky top-0 z-20 flex h-[70px] items-center justify-between border-b border-border/80 bg-background/90 px-5 backdrop-blur-md md:px-10"><button data-testid="button-open-menu" className="rounded-lg p-2 hover:bg-muted md:hidden" onClick={() => setMobileOpen(true)}><Menu size={20} /></button><div className="hidden text-sm text-muted-foreground md:block">{location === '/' ? 'A calmer way to find funding' : 'Keep moving toward what’s next'}</div><div className="ml-auto flex items-center gap-3"><Link data-testid="link-header-notifications" href="/notifications" className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"><Bell size={19} /><UnreadDot /></Link><Link data-testid="link-header-profile" href="/profile" className="hidden items-center gap-2.5 sm:flex"><span className="grid h-8 w-8 place-items-center rounded-full bg-primary/10 font-display text-xs font-bold text-primary">{initials(profile?.name)}</span><span className="text-sm font-semibold">{profile?.name?.split(' ')[0] || 'Student'}</span></Link></div></header><div className="px-5 py-8 md:px-10 md:py-10">{children}<p className="mx-auto mt-10 max-w-3xl border-t border-border/70 pt-5 text-xs leading-5 text-muted-foreground">Eligibility information is provided for guidance. Please verify the official scholarship notification and requirements before applying.</p></div></main>
  </div>;
}
function UnreadDot() {
  const query = useListNotifications({ query: { queryKey: getListNotificationsQueryKey(), staleTime: 30000 } });
  const count = (query.data || []).filter((note) => !note.read).length;
  return count > 0 ? <span data-testid="status-unread" className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent ring-2 ring-background" /> : null;
}

function PageHeading({ eyebrow, title, detail, action }: { eyebrow?: string; title: string; detail?: string; action?: React.ReactNode }) {
  return <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div>{eyebrow && <p className="mb-2 text-xs font-bold uppercase tracking-[.15em] text-accent">{eyebrow}</p>}<h1 className="font-display text-3xl font-bold tracking-tight text-balance md:text-4xl">{title}</h1>{detail && <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{detail}</p>}</div>{action}</div>;
}

function ScholarshipCard({ scholarship, savedIds, onSave, compact = false }: { scholarship: Scholarship | Recommendation; savedIds: Set<number>; onSave: (scholarship: Scholarship) => void; compact?: boolean }) {
  const isSaved = savedIds.has(scholarship.id);
  return <article data-testid={`card-scholarship-${scholarship.id}`} className={`group relative flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg ${compact ? 'p-4' : ''}`}>
    <div className="mb-5 flex items-start justify-between gap-3"><div className="flex min-w-0 items-center gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-secondary font-display font-bold text-primary">{scholarship.provider.slice(0, 1)}</span><div className="min-w-0"><p className="truncate text-xs font-semibold text-muted-foreground">{scholarship.provider}</p><p className="mt-0.5 truncate text-xs text-muted-foreground/70">{scholarship.location || 'Open location'}</p></div></div><button data-testid={`button-save-scholarship-${scholarship.id}`} onClick={() => onSave(scholarship)} className={`rounded-lg p-2 transition-colors ${isSaved ? 'bg-secondary text-primary' : 'text-muted-foreground hover:bg-muted hover:text-primary'}`} aria-label={isSaved ? 'Remove saved scholarship' : 'Save scholarship'}>{isSaved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}</button></div>
    <Link data-testid={`link-scholarship-${scholarship.id}`} href={`/scholarships/${scholarship.id}`} className="block flex-1"><h3 className="font-display text-lg font-semibold leading-snug transition-colors group-hover:text-primary">{scholarship.title}</h3><p className="mt-2 line-clamp-2 text-sm leading-5 text-muted-foreground">{scholarship.description}</p>{'reasons' in scholarship && <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-primary"><Sparkles size={13} /> {scholarship.matchScore}% match</div>}</Link>
    <div className="mt-5 flex items-end justify-between gap-3 border-t border-border/70 pt-4"><div><p className="font-display text-lg font-bold text-foreground">{formatMoney(scholarship.amount, scholarship.currency)}</p><p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><CalendarDays size={12} /> Due {dateLabel(scholarship.deadline)}</p></div><Link data-testid={`link-view-scholarship-${scholarship.id}`} href={`/scholarships/${scholarship.id}`} className="flex items-center gap-1 text-xs font-bold text-primary transition-transform group-hover:translate-x-0.5">View <ArrowRight size={14} /></Link></div>
  </article>;
}

function SaveButton({ scholarship, saved, onChange }: { scholarship: Scholarship; saved: boolean; onChange: () => void }) {
  return <Button data-testid="button-save-detail" variant={saved ? 'secondary' : 'outline'} onClick={onChange}>{saved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}{saved ? 'Saved' : 'Save for later'}</Button>;
}

function Home() {
  const profileQuery = useGetProfile({ query: { queryKey: getGetProfileQueryKey(), staleTime: 30000 } });
  return <Shell><section className="relative overflow-hidden rounded-[28px] bg-primary px-6 py-14 text-primary-foreground shadow-xl md:px-14 md:py-20"><div className="absolute -right-20 -top-24 h-72 w-72 rounded-full border-[32px] border-secondary/20" /><div className="absolute bottom-[-100px] right-[18%] h-64 w-64 rounded-full bg-secondary/10" /><div className="relative max-w-3xl float-in"><div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-3 py-1.5 text-xs font-semibold"><Sparkles size={14} className="text-secondary" /> Built for the next chapter</div><h1 className="max-w-2xl font-display text-4xl font-bold leading-[1.06] tracking-tight md:text-6xl">Funding your future shouldn’t feel like a second job.</h1><p className="mt-6 max-w-xl text-base leading-7 text-primary-foreground/75 md:text-lg">Scholarship Finder turns your profile into a clear, explainable shortlist of scholarships you can actually pursue.</p><div className="mt-8 flex flex-wrap gap-3"><Link data-testid="link-start-profile" href="/profile" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-secondary px-5 py-3 text-sm font-bold text-secondary-foreground transition-transform hover:-translate-y-0.5">Build my profile <ArrowRight size={16} /></Link><Link data-testid="link-explore-scholarships" href="/search" className="inline-flex min-h-11 items-center rounded-xl border border-primary-foreground/25 px-5 py-3 text-sm font-semibold transition-colors hover:bg-primary-foreground/10">Explore scholarships</Link></div></div></section><section className="grid gap-4 py-10 md:grid-cols-3"><div className="rounded-2xl border border-border bg-card p-6 float-in-delay"><Target className="text-accent" /><h2 className="mt-5 font-display text-xl font-semibold">Matches with a reason</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">See exactly why an opportunity fits your education, field, and goals.</p></div><div className="rounded-2xl border border-border bg-card p-6 float-in-delay-2"><BriefcaseBusiness className="text-primary" /><h2 className="mt-5 font-display text-xl font-semibold">One calm shortlist</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Save promising awards and keep your research somewhere you’ll find it again.</p></div><div className="rounded-2xl border border-border bg-card p-6"><CircleDollarSign className="text-accent" /><h2 className="mt-5 font-display text-xl font-semibold">Progress, not pressure</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Track applications and deadlines with a view that keeps the next step visible.</p></div></section>{!profileQuery.data && <div className="rounded-2xl border border-secondary/70 bg-secondary/35 p-5 sm:flex sm:items-center sm:justify-between"><div><p className="font-display font-semibold">Start with the details that make matching work</p><p className="mt-1 text-sm text-muted-foreground">A thoughtful profile takes about two minutes.</p></div><Link data-testid="link-complete-profile" href="/profile" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary sm:mt-0">Complete profile <ArrowRight size={15} /></Link></div>}</Shell>;
}

function DashboardPage() {
  const query = useGetDashboard({ query: { queryKey: getGetDashboardQueryKey(), staleTime: 20000 } });
  const savedQuery = useListSavedScholarships({ query: { queryKey: getListSavedScholarshipsQueryKey(), staleTime: 20000 } });
  const queryClient = useQueryClient();
  const save = useSaveScholarship();
  const unsave = useUnsaveScholarship();
  const { toast } = useToast();
  const savedIds = useMemo(() => new Set((savedQuery.data || []).map((item) => item.id)), [savedQuery.data]);
  const onSave = (scholarship: Scholarship) => {
    const action = savedIds.has(scholarship.id) ? unsave : save;
    action.mutate({ scholarshipId: scholarship.id }, { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListSavedScholarshipsQueryKey() }); queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() }); toast({ title: savedIds.has(scholarship.id) ? 'Removed from saved' : 'Saved for later' }); } });
  };
  if (query.isLoading) return <Shell><LoadingState /></Shell>;
  if (query.isError || !query.data) return <Shell><ErrorState onRetry={() => query.refetch()} /></Shell>;
  const data = query.data;
  const statCards: Array<[string, number, typeof Sparkles, string]> = [['Matches', data.recommendedCount, Sparkles, '/recommendations'], ['Saved', data.savedCount, Bookmark, '/saved'], ['In progress', data.appliedCount, FileCheck2, '/applications'], ['Deadlines ahead', data.upcomingDeadlines, CalendarDays, '/applications']];
  return <Shell><PageHeading eyebrow="Your overview" title={`Good to see you${data.profile?.name ? `, ${data.profile.name.split(' ')[0]}` : ''}.`} detail="A little clarity for the funding journey ahead." action={<Link data-testid="link-dashboard-search" href="/search" className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground">Find opportunities <ArrowRight size={15} /></Link>} /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{statCards.map(([label, count, Icon, href]) => <Link data-testid={`link-stat-${String(label).toLowerCase().replace(' ', '-')}`} href={href} key={label} className="rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:shadow-md"><div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">{label}</span><span className="rounded-lg bg-secondary p-2 text-primary"><Icon size={16} /></span></div><p className="mt-4 font-display text-3xl font-bold">{count}</p><p className="mt-1 text-xs text-muted-foreground">{label === 'Deadlines ahead' ? 'in the next 30 days' : 'based on your profile'}</p></Link>)}</div><div className="mt-8 grid gap-6 xl:grid-cols-[1.5fr_1fr]"><section><div className="mb-4 flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-[.15em] text-accent">Strongest fits</p><h2 className="mt-1 font-display text-2xl font-bold">Your top matches</h2></div><Link data-testid="link-all-recommendations" href="/recommendations" className="text-sm font-bold text-primary">See all <ArrowRight className="ml-1 inline" size={14} /></Link></div>{data.topMatches?.length ? <div className="grid gap-4 lg:grid-cols-2">{data.topMatches.slice(0, 4).map((item) => <ScholarshipCard key={item.id} scholarship={item} savedIds={savedIds} onSave={onSave} compact />)}</div> : <EmptyState title="Your shortlist is taking shape" detail="Complete your profile to see scholarships selected for your goals." action={<Link data-testid="link-dashboard-profile" href="/profile" className="mt-5 inline-flex text-sm font-bold text-primary">Complete profile <ArrowRight size={14} className="ml-1" /></Link>} />}</section><section><div className="mb-4"><p className="text-xs font-bold uppercase tracking-[.15em] text-accent">Keep momentum</p><h2 className="mt-1 font-display text-2xl font-bold">Application pulse</h2></div><div className="rounded-2xl border border-border bg-card p-5">{data.applications?.length ? data.applications.slice(0, 4).map((application) => <ApplicationRow key={application.id} application={application} />) : <EmptyState title="Nothing in progress" detail="When an opportunity feels right, add it here to keep your next step close." action={<Link data-testid="link-dashboard-find" href="/search" className="mt-5 inline-flex text-sm font-bold text-primary">Find a scholarship <ArrowRight size={14} className="ml-1" /></Link>} />}</div></section></div></Shell>;
}

function SearchPage() {
  const [search, setSearch] = useState('');
  const [educationLevel, setEducationLevel] = useState('');
  const [field, setField] = useState('');
  const [type, setType] = useState('');
  const [sort, setSort] = useState('deadline');
  const params = useMemo(() => ({ search: search || undefined, educationLevel: educationLevel || undefined, field: field || undefined, type: type || undefined, sort }), [search, educationLevel, field, type, sort]);
  const query = useListScholarships(params, { query: { queryKey: getListScholarshipsQueryKey(params) } });
  const savedQuery = useListSavedScholarships({ query: { queryKey: getListSavedScholarshipsQueryKey() } });
  const queryClient = useQueryClient(); const save = useSaveScholarship(); const unsave = useUnsaveScholarship(); const { toast } = useToast();
  const savedIds = useMemo(() => new Set((savedQuery.data || []).map((item) => item.id)), [savedQuery.data]);
  const onSave = (scholarship: Scholarship) => { const saved = savedIds.has(scholarship.id); (saved ? unsave : save).mutate({ scholarshipId: scholarship.id }, { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListSavedScholarshipsQueryKey() }); toast({ title: saved ? 'Removed from saved' : 'Saved for later' }); } }); };
  return <Shell><PageHeading eyebrow="Opportunity library" title="Find funding that fits." detail="Search a growing library of scholarships, with filters that keep the signal high." /><div className="mb-7 rounded-2xl border border-border bg-card p-3 shadow-sm"><div className="flex flex-col gap-3 lg:flex-row"><div className="relative flex-1"><Search className="absolute left-3 top-3 text-muted-foreground" size={17} /><Input data-testid="input-search-scholarships" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by scholarship, provider, or field" className="h-11 border-0 bg-muted/60 pl-10 shadow-none focus-visible:ring-1" /></div><div className="flex flex-wrap gap-2"><select data-testid="select-education-level" value={educationLevel} onChange={(event) => setEducationLevel(event.target.value)} className="h-11 rounded-lg border border-border bg-background px-3 text-sm"><option value="">Education level</option><option value="Undergraduate">Undergraduate</option><option value="Postgraduate">Postgraduate</option><option value="High School">High school</option></select><select data-testid="select-field" value={field} onChange={(event) => setField(event.target.value)} className="h-11 rounded-lg border border-border bg-background px-3 text-sm"><option value="">Field of study</option><option value="Engineering">Engineering</option><option value="Arts">Arts</option><option value="Business">Business</option><option value="Science">Science</option></select><select data-testid="select-type" value={type} onChange={(event) => setType(event.target.value)} className="h-11 rounded-lg border border-border bg-background px-3 text-sm"><option value="">Type</option><option value="Merit">Merit</option><option value="Need-based">Need-based</option><option value="Community">Community</option></select></div></div><div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3"><p className="flex items-center gap-2 text-xs text-muted-foreground"><ListFilter size={14} /> {query.data?.length ?? 0} opportunities to explore</p><select data-testid="select-sort" value={sort} onChange={(event) => setSort(event.target.value)} className="rounded-lg border-0 bg-transparent px-2 py-1 text-xs font-semibold text-primary"><option value="deadline">Sort: deadline soon</option><option value="amount">Sort: award amount</option><option value="match">Sort: best match</option></select></div></div>{query.isError ? <ErrorState onRetry={() => query.refetch()} /> : query.isLoading ? <LoadingState /> : query.data?.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{query.data.map((scholarship) => <ScholarshipCard key={scholarship.id} scholarship={scholarship} savedIds={savedIds} onSave={onSave} />)}</div> : <EmptyState title="No scholarships matched that search" detail="Try a broader field or clear one of the filters. New opportunities are added regularly." action={<Button data-testid="button-clear-search" variant="outline" className="mt-5" onClick={() => { setSearch(''); setField(''); setType(''); setEducationLevel(''); }}>Clear filters</Button>} />}</Shell>;
}

function RecommendationsPage() {
  const query = useGetRecommendations({ query: { queryKey: getGetRecommendationsQueryKey() } });
  const savedQuery = useListSavedScholarships({ query: { queryKey: getListSavedScholarshipsQueryKey() } });
  const queryClient = useQueryClient(); const save = useSaveScholarship(); const unsave = useUnsaveScholarship(); const { toast } = useToast();
  const savedIds = useMemo(() => new Set((savedQuery.data || []).map((item) => item.id)), [savedQuery.data]);
  const onSave = (item: Scholarship) => { const saved = savedIds.has(item.id); (saved ? unsave : save).mutate({ scholarshipId: item.id }, { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListSavedScholarshipsQueryKey() }); toast({ title: saved ? 'Removed from saved' : 'Saved for later' }); } }); };
  return <Shell><PageHeading eyebrow="Personalized for you" title="Shortlist, with the why." detail="These matches are based on your profile. We’ll show the reasoning, not just a percentage." action={<Link data-testid="link-recommendations-profile" href="/profile" className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-bold">Tune my profile <SlidersHorizontal size={15} /></Link>} />{query.isLoading ? <LoadingState label="Comparing your profile with opportunities" /> : query.isError ? <ErrorState onRetry={() => query.refetch()} /> : query.data?.length ? <div className="grid gap-5 lg:grid-cols-2">{query.data.map((item) => <RecommendationCard key={item.id} item={item} savedIds={savedIds} onSave={onSave} />)}</div> : <EmptyState title="Your personal shortlist is waiting" detail="Add your education, field, and a few eligibility details to unlock explainable matches." action={<Link data-testid="link-recommendations-profile-empty" href="/profile" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground">Build my profile <ArrowRight size={15} /></Link>} />}</Shell>;
}
function RecommendationCard({ item, savedIds, onSave }: { item: Recommendation; savedIds: Set<number>; onSave: (s: Scholarship) => void }) {
  return <article data-testid={`card-recommendation-${item.id}`} className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/30 hover:shadow-lg"><div className="flex items-start justify-between gap-4"><div><div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs font-bold text-primary"><Sparkles size={12} /> {item.matchScore}% match</div><h2 className="font-display text-xl font-semibold">{item.title}</h2><p className="mt-1 text-sm text-muted-foreground">{item.provider}</p></div><button data-testid={`button-save-recommendation-${item.id}`} onClick={() => onSave(item)} className={`rounded-lg p-2 ${savedIds.has(item.id) ? 'bg-secondary text-primary' : 'bg-muted text-muted-foreground'}`}>{savedIds.has(item.id) ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}</button></div><div className="mt-5 rounded-xl bg-secondary/45 p-4"><p className="text-xs font-bold uppercase tracking-wider text-primary">Why this is here</p><ul className="mt-2 space-y-2 text-sm leading-5 text-foreground/80">{item.reasons?.slice(0, 3).map((reason, index) => <li data-testid={`text-reason-${item.id}-${index}`} key={reason} className="flex gap-2"><Check size={15} className="mt-0.5 shrink-0 text-primary" />{reason}</li>)}</ul></div>{item.missingRequirements?.length ? <p className="mt-4 flex gap-2 text-xs leading-5 text-muted-foreground"><CircleAlert size={14} className="mt-0.5 shrink-0 text-accent" />Still needed: {item.missingRequirements.join(', ')}</p> : null}<div className="mt-5 flex items-center justify-between border-t border-border/70 pt-4"><span className="font-display font-bold">{formatMoney(item.amount, item.currency)}</span><Link data-testid={`link-recommendation-${item.id}`} href={`/scholarships/${item.id}`} className="text-sm font-bold text-primary">Review fit <ArrowRight size={14} className="ml-1 inline" /></Link></div></article>;
}

function SavedPage() {
  const query = useListSavedScholarships({ query: { queryKey: getListSavedScholarshipsQueryKey() } });
  const queryClient = useQueryClient(); const unsave = useUnsaveScholarship(); const { toast } = useToast();
  const onSave = (item: Scholarship) => unsave.mutate({ scholarshipId: item.id }, { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListSavedScholarshipsQueryKey() }); toast({ title: 'Removed from saved' }); } });
  return <Shell><PageHeading eyebrow="Your shelf" title="Saved for later." detail="Keep the possibilities you want to return to, without losing them in another tab." action={<Link data-testid="link-saved-search" href="/search" className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground"><Search size={15} /> Find more</Link>} />{query.isLoading ? <LoadingState /> : query.isError ? <ErrorState onRetry={() => query.refetch()} /> : query.data?.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{query.data.map((item) => <ScholarshipCard key={item.id} scholarship={item} savedIds={new Set(query.data?.map((saved) => saved.id))} onSave={onSave} />)}</div> : <EmptyState title="Your saved shelf is empty" detail="When a scholarship feels promising, tap the bookmark to keep it close." action={<Link data-testid="link-empty-saved-search" href="/search" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground">Browse scholarships <ArrowRight size={15} /></Link>} />}</Shell>;
}

function ScholarshipDetailPage() {
  const params = useParams<{ id: string }>(); const id = Number(params.id);
  const query = useGetScholarship(id, { query: { queryKey: getGetScholarshipQueryKey(id), enabled: Number.isFinite(id) } });
  const savedQuery = useListSavedScholarships({ query: { queryKey: getListSavedScholarshipsQueryKey() } });
  const queryClient = useQueryClient(); const save = useSaveScholarship(); const unsave = useUnsaveScholarship(); const create = useCreateApplication(); const { toast } = useToast();
  const scholarship = query.data; const saved = !!savedQuery.data?.some((item) => item.id === id);
  const saveChange = () => { (saved ? unsave : save).mutate({ scholarshipId: id }, { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListSavedScholarshipsQueryKey() }); toast({ title: saved ? 'Removed from saved' : 'Saved for later' }); } }); };
  const apply = () => { if (!scholarship) return; create.mutate({ data: { scholarshipId: scholarship.id, status: 'planned', notes: '' } }, { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListApplicationsQueryKey() }); queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() }); toast({ title: 'Added to your application tracker' }); }, onError: () => toast({ title: 'Could not add this application', variant: 'destructive' }) }); };
  if (query.isLoading) return <Shell><LoadingState /></Shell>;
  if (query.isError || !scholarship) return <Shell><ErrorState onRetry={() => query.refetch()} /></Shell>;
  return <Shell><Link data-testid="link-back-search" href="/search" className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary">← Back to scholarships</Link><div className="grid gap-8 xl:grid-cols-[1fr_340px]"><article><div className="mb-7 flex items-start gap-4"><span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-secondary font-display text-2xl font-bold text-primary">{scholarship.provider.slice(0, 1)}</span><div><p className="text-sm font-semibold text-muted-foreground">{scholarship.provider}</p><h1 className="mt-1 font-display text-3xl font-bold leading-tight tracking-tight md:text-5xl">{scholarship.title}</h1><div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground"><span className="flex items-center gap-1"><MapPin size={14} /> {scholarship.location}</span><span className="text-border">·</span><span>{scholarship.educationLevel}</span><span className="text-border">·</span><span>{scholarship.type}</span></div></div></div><div className="rounded-2xl bg-primary p-6 text-primary-foreground md:p-8"><p className="text-xs font-bold uppercase tracking-[.16em] text-primary-foreground/65">Award amount</p><p className="mt-2 font-display text-4xl font-bold">{formatMoney(scholarship.amount, scholarship.currency)}</p><p className="mt-3 flex items-center gap-2 text-sm text-primary-foreground/75"><CalendarDays size={15} /> Deadline {dateLabel(scholarship.deadline)} · {daysLeft(scholarship.deadline)}</p></div><div className="mt-8 space-y-8"><section><h2 className="font-display text-xl font-bold">About this opportunity</h2><p className="mt-3 max-w-3xl whitespace-pre-line text-sm leading-7 text-muted-foreground">{scholarship.description}</p></section>{scholarship.benefits?.length ? <section><h2 className="font-display text-xl font-bold">What it covers</h2><ul className="mt-3 grid gap-2 sm:grid-cols-2">{scholarship.benefits.map((benefit) => <li key={benefit} className="flex gap-2 rounded-xl bg-card p-3 text-sm"><Check size={16} className="mt-0.5 text-primary" />{benefit}</li>)}</ul></section> : null}<section><h2 className="font-display text-xl font-bold">Eligibility</h2><ul className="mt-3 space-y-2">{(scholarship.eligibilityCriteria || []).map((criterion) => <li key={criterion} className="flex gap-2 text-sm text-muted-foreground"><Check size={16} className="mt-0.5 shrink-0 text-primary" />{criterion}</li>)}{scholarship.minimumPercentage ? <li className="flex gap-2 text-sm text-muted-foreground"><Check size={16} className="mt-0.5 shrink-0 text-primary" />Minimum percentage: {scholarship.minimumPercentage}%</li> : null}</ul></section></div></article><aside className="h-fit rounded-2xl border border-border bg-card p-5 shadow-sm xl:sticky xl:top-[95px]"><p className="text-xs font-bold uppercase tracking-[.16em] text-accent">Ready when you are</p><h2 className="mt-2 font-display text-xl font-bold">Make this one yours to revisit.</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Save it for later or add it to your tracker so the deadline stays visible.</p><div className="mt-5 grid gap-2"><SaveButton scholarship={scholarship} saved={saved} onChange={saveChange} /><Button data-testid="button-add-application" onClick={apply} disabled={create.isPending} className="w-full">{create.isPending ? <LoaderCircle className="animate-spin" size={16} /> : <FileCheck2 size={16} />} {create.isPending ? 'Adding…' : 'Add to application tracker'}</Button>{scholarship.applicationUrl && <a data-testid="link-apply-external" href={scholarship.applicationUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold text-primary hover:underline">Visit provider site <ExternalLink size={14} /></a>}</div></aside></div></Shell>;
}

function ProfilePage() {
  const query = useGetProfile({ query: { queryKey: getGetProfileQueryKey() } }); const update = useUpdateProfile(); const queryClient = useQueryClient(); const { toast } = useToast();
  const [form, setForm] = useState<Record<string, string>>({});
  useEffect(() => { if (query.data) setForm(Object.fromEntries(Object.entries(query.data).filter(([key]) => ['name', 'educationLevel', 'field', 'state', 'category', 'gender', 'institution', 'familyIncome', 'percentage'].includes(key)).map(([key, value]) => [key, value ?? '']))); }, [query.data]);
  const set = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const submit = (event: React.FormEvent) => { event.preventDefault(); const data = { ...form, familyIncome: form.familyIncome ? Number(form.familyIncome) : undefined, percentage: form.percentage ? Number(form.percentage) : undefined }; update.mutate({ data }, { onSuccess: (profile) => { queryClient.setQueryData(getGetProfileQueryKey(), profile); queryClient.invalidateQueries({ queryKey: getGetRecommendationsQueryKey() }); queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() }); toast({ title: 'Profile updated', description: 'Your matches will reflect these details.' }); } }); };
  if (query.isLoading) return <Shell><LoadingState label="Loading your profile" /></Shell>;
  if (query.isError) return <Shell><ErrorState onRetry={() => query.refetch()} /></Shell>;
  const profile = query.data; const completion = profile?.completion || 0;
  return <Shell><PageHeading eyebrow="Your details" title="Build a profile that works for you." detail="The more you share, the more precise your matches become. You can update these details anytime." /><div className="grid gap-6 xl:grid-cols-[1fr_320px]"><form data-testid="form-profile" onSubmit={submit} className="rounded-2xl border border-border bg-card p-6 md:p-8"><div className="grid gap-5 md:grid-cols-2"><Field label="Full name" value={form.name} onChange={(value) => set('name', value)} testId="input-profile-name" /><Field label="Institution" value={form.institution} onChange={(value) => set('institution', value)} testId="input-profile-institution" /><SelectField label="Education level" value={form.educationLevel} onChange={(value) => set('educationLevel', value)} options={['High School', 'Undergraduate', 'Postgraduate']} testId="select-profile-education" /><SelectField label="Field of study" value={form.field} onChange={(value) => set('field', value)} options={['Engineering', 'Science', 'Business', 'Arts', 'Medicine', 'Law']} testId="select-profile-field" /><Field label="State or region" value={form.state} onChange={(value) => set('state', value)} testId="input-profile-state" /><SelectField label="Community category" value={form.category} onChange={(value) => set('category', value)} options={['General', 'First generation', 'Rural', 'Minority', 'Women in STEM']} testId="select-profile-category" /><Field label="Current percentage" type="number" value={form.percentage} onChange={(value) => set('percentage', value)} testId="input-profile-percentage" /><Field label="Annual family income" type="number" value={form.familyIncome} onChange={(value) => set('familyIncome', value)} testId="input-profile-income" /></div><div className="mt-5 max-w-[calc(50%-10px)]"><SelectField label="Gender (optional)" value={form.gender} onChange={(value) => set('gender', value)} options={['Prefer not to say', 'Female', 'Male', 'Non-binary']} testId="select-profile-gender" /></div><div className="mt-8 flex items-center justify-end border-t border-border pt-5"><Button data-testid="button-save-profile" type="submit" disabled={update.isPending}>{update.isPending ? <LoaderCircle className="animate-spin" size={16} /> : <Check size={16} />} {update.isPending ? 'Saving…' : 'Save profile'}</Button></div></form><aside className="h-fit rounded-2xl border border-border bg-card p-6"><div className="flex items-center justify-between"><p className="text-xs font-bold uppercase tracking-[.15em] text-accent">Profile strength</p><span className="font-display text-2xl font-bold text-primary">{completion}%</span></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-secondary transition-all" style={{ width: `${completion}%` }} /></div><p className="mt-4 text-sm leading-6 text-muted-foreground">{completion >= 80 ? 'You’re giving us a clear picture. Your matches should feel much more personal now.' : 'A few more details will help us spot opportunities you might otherwise miss.'}</p>{profile?.missing?.length ? <div className="mt-6 border-t border-border pt-5"><p className="text-sm font-semibold">Still to add</p><ul className="mt-3 space-y-2">{profile.missing.map((missing) => <li key={missing} className="flex items-center gap-2 text-sm text-muted-foreground"><CircleAlert size={14} className="text-accent" />{missing}</li>)}</ul></div> : null}</aside></div></Shell>;
}
function Field({ label, value, onChange, type = 'text', testId }: { label: string; value?: string; onChange: (v: string) => void; type?: string; testId: string }) { return <label className="grid gap-2 text-sm font-semibold">{label}<Input data-testid={testId} type={type} value={value || ''} onChange={(event) => onChange(event.target.value)} className="h-11 bg-background font-normal" /></label>; }
function SelectField({ label, value, onChange, options, testId }: { label: string; value?: string; onChange: (v: string) => void; options: string[]; testId: string }) { return <label className="grid gap-2 text-sm font-semibold">{label}<select data-testid={testId} value={value || ''} onChange={(event) => onChange(event.target.value)} className="h-11 rounded-md border border-input bg-background px-3 text-sm font-normal"><option value="">Choose one</option>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>; }

function ApplicationRow({ application, onUpdate }: { application: Application; onUpdate?: (id: number, status: string, notes?: string) => void }) {
  const [notes, setNotes] = useState(application.notes || '');
  const statusTone = application.status === 'submitted' || application.status === 'awarded' ? 'bg-secondary text-primary' : application.status === 'rejected' ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground';
  return <div data-testid={`row-application-${application.id}`} className="border-b border-border/70 py-4 last:border-0"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-semibold">{application.scholarshipTitle}</p><p className="mt-1 text-xs text-muted-foreground">{application.provider} · Deadline {dateLabel(application.deadline)}</p></div><span data-testid={`status-application-${application.id}`} className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ${statusTone}`}>{application.status}</span></div>{onUpdate && <div className="mt-3 flex flex-col gap-2 sm:flex-row"><select data-testid={`select-application-status-${application.id}`} value={application.status} onChange={(event) => onUpdate(application.id, event.target.value, notes)} className="h-9 rounded-md border border-input bg-background px-2 text-xs"><option value="planned">Planned</option><option value="in_progress">In progress</option><option value="submitted">Submitted</option><option value="awarded">Awarded</option><option value="rejected">Not selected</option></select><Input data-testid={`input-application-notes-${application.id}`} value={notes} onChange={(event) => setNotes(event.target.value)} onBlur={() => onUpdate(application.id, application.status, notes)} placeholder="Add a note…" className="h-9 text-xs" /></div>}</div>;
}
function ApplicationsPage() {
  const query = useListApplications({ query: { queryKey: getListApplicationsQueryKey() } }); const update = useUpdateApplication(); const queryClient = useQueryClient(); const { toast } = useToast();
  const updateApplication = (id: number, status: string, notes?: string) => update.mutate({ id, data: { status, notes } }, { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListApplicationsQueryKey() }); queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() }); toast({ title: 'Application updated' }); } });
  return <Shell><PageHeading eyebrow="Your tracker" title="Keep the next step visible." detail="A simple place for the applications you’ve decided are worth your time." action={<Link data-testid="link-applications-find" href="/search" className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground">Add an opportunity <ArrowRight size={15} /></Link>} />{query.isLoading ? <LoadingState /> : query.isError ? <ErrorState onRetry={() => query.refetch()} /> : query.data?.length ? <div className="grid gap-4">{query.data.map((application) => <div key={application.id} className="rounded-2xl border border-border bg-card px-5"><ApplicationRow application={application} onUpdate={updateApplication} /></div>)}</div> : <EmptyState title="Your tracker is clear" detail="Add a scholarship when you’re ready to give it a real shot. We’ll keep the details and deadline together." action={<Link data-testid="link-empty-applications-search" href="/search" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground">Browse scholarships <Search size={15} /></Link>} />}</Shell>;
}

function NotificationsPage() {
  const query = useListNotifications({ query: { queryKey: getListNotificationsQueryKey() } }); const mark = useMarkNotificationRead(); const queryClient = useQueryClient();
  return <Shell><PageHeading eyebrow="Updates" title="Notifications." detail="Helpful nudges about your saved opportunities and application progress." />{query.isLoading ? <LoadingState label="Checking for updates" /> : query.isError ? <ErrorState onRetry={() => query.refetch()} /> : query.data?.length ? <div className="max-w-3xl divide-y divide-border rounded-2xl border border-border bg-card">{query.data.map((note) => <button data-testid={`button-notification-${note.id}`} key={note.id} onClick={() => { if (!note.read) mark.mutate({ id: note.id }, { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey() }) }); }} className={`flex w-full gap-4 p-5 text-left transition-colors hover:bg-muted/40 ${!note.read ? 'bg-secondary/20' : ''}`}><span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${note.read ? 'bg-border' : 'bg-accent'}`} /><span className="min-w-0 flex-1"><span className="flex flex-wrap items-center justify-between gap-2"><span className="font-display font-semibold">{note.title}</span><span className="text-xs text-muted-foreground">{dateLabel(note.createdAt)}</span></span><span className="mt-1 block text-sm leading-6 text-muted-foreground">{note.message}</span></span></button>)}</div> : <EmptyState title="You’re all caught up" detail="New reminders and updates will appear here when they have something useful to say." />}</Shell>;
}

function SettingsPage() {
  const profileQuery = useGetProfile({ query: { queryKey: getGetProfileQueryKey() } });
  return <Shell><PageHeading eyebrow="Account" title="Settings." detail="Your profile is the source of truth for matching. These are the details we currently have on file." /><div className="max-w-3xl space-y-4"><div className="rounded-2xl border border-border bg-card p-6"><div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-xl bg-secondary text-primary"><UserRound size={20} /></div><div><p className="font-display font-semibold">{profileQuery.data?.name || 'Your account'}</p><p className="text-sm text-muted-foreground">{profileQuery.data?.email || 'Profile email'}</p></div></div><Link data-testid="link-settings-profile" href="/profile" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary">Edit profile <PencilLine size={15} /></Link></div><div className="rounded-2xl border border-border bg-card p-6"><p className="font-display font-semibold">How matching works</p><p className="mt-2 text-sm leading-6 text-muted-foreground">We compare your education level, field, location, category, academic performance, and financial context against scholarship criteria. You’ll always see the reasons behind a recommendation.</p></div></div></Shell>;
}

export { Home, DashboardPage, SearchPage, ScholarshipDetailPage, ProfilePage, RecommendationsPage, SavedPage, ApplicationsPage, NotificationsPage, SettingsPage };