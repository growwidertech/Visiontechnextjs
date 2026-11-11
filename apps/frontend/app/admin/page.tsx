'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  FolderKanban,
  Image as ImageIcon,
  MessageSquareQuote,
  BookOpen,
  Inbox,
  Globe,
  Settings,
  Users,
  LogOut,
  Plus,
  Trash2,
  Edit3,
  ArrowUp,
  ArrowDown,
  Eye,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Search,
  Sparkles,
  Shield,
  Copy,
  Check,
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch, API_BASE_URL } from '@/lib/api';
import { useAuth } from '@/components/Providers';
import { BrandLogo } from '@/components/Navbar';
import { RichTextEditor } from '@/components/RichTextEditor';
import {
  PROJECT_CATEGORIES,
  ENQUIRY_STATUSES,
  SUPPORTED_LOCALES,
} from '@vision/shared';

type AdminTab =
  | 'dashboard'
  | 'pages'
  | 'projects'
  | 'services'
  | 'gallery'
  | 'testimonials'
  | 'blog'
  | 'enquiries'
  | 'seo'
  | 'settings'
  | 'users';

export default function AdminCmsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, loading: authLoading, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [toast, setToast] = useState<{ ok: boolean; text: string } | null>(null);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const showToast = (text: string, ok = true) => {
    setToast({ ok, text });
    setTimeout(() => setToast(null), 4500);
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/admin/login');
    }
  }, [authLoading, user, router]);

  // Queries for Admin Modules
  const { data: dashData } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => apiFetch('/dashboard'),
    enabled: Boolean(user),
  });

  const { data: pagesList = [] } = useQuery({
    queryKey: ['admin-pages'],
    queryFn: () => apiFetch('/pages?admin=true'),
    enabled: Boolean(user),
  });

  const [selectedPageSlug, setSelectedPageSlug] = useState('home');
  const { data: selectedPageDetail, refetch: refetchPageDetail } = useQuery({
    queryKey: ['admin-page-detail', selectedPageSlug],
    queryFn: () => apiFetch(`/pages/${selectedPageSlug}?preview=true`),
    enabled: Boolean(user && selectedPageSlug),
  });

  const { data: projectsData } = useQuery({
    queryKey: ['admin-projects'],
    queryFn: () => apiFetch('/projects?admin=true&limit=100'),
    enabled: Boolean(user),
  });

  const { data: servicesList = [] } = useQuery({
    queryKey: ['admin-services'],
    queryFn: () => apiFetch('/services?admin=true'),
    enabled: Boolean(user),
  });

  const { data: galleryData } = useQuery({
    queryKey: ['admin-gallery'],
    queryFn: () => apiFetch('/gallery?admin=true'),
    enabled: Boolean(user),
  });

  const { data: mediaList = [] } = useQuery({
    queryKey: ['admin-media'],
    queryFn: () => apiFetch('/media'),
    enabled: Boolean(user),
  });

  const { data: testimonialsList = [] } = useQuery({
    queryKey: ['admin-testimonials'],
    queryFn: () => apiFetch('/testimonials?admin=true'),
    enabled: Boolean(user),
  });

  const { data: blogData } = useQuery({
    queryKey: ['admin-blog'],
    queryFn: () => apiFetch('/blog?admin=true'),
    enabled: Boolean(user),
  });

  const [enquiryStatusFilter, setEnquiryStatusFilter] = useState('All');
  const [enquiryServiceFilter, setEnquiryServiceFilter] = useState('All');
  const [enquirySearch, setEnquirySearch] = useState('');
  const { data: enquiriesList = [] } = useQuery({
    queryKey: [
      'admin-enquiries',
      enquiryStatusFilter,
      enquiryServiceFilter,
      enquirySearch,
    ],
    queryFn: () => {
      const p = new URLSearchParams();
      if (enquiryStatusFilter !== 'All') p.set('status', enquiryStatusFilter);
      if (enquiryServiceFilter !== 'All') p.set('service', enquiryServiceFilter);
      if (enquirySearch.trim()) p.set('search', enquirySearch.trim());
      return apiFetch(`/enquiries?${p.toString()}`);
    },
    enabled: Boolean(user),
  });

  const { data: globalSettings } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => apiFetch('/settings'),
    enabled: Boolean(user),
  });

  const { data: usersRbacData } = useQuery({
    queryKey: ['admin-users-rbac'],
    queryFn: () => apiFetch('/users'),
    enabled: Boolean(user),
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['public-bundle'] });
    queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
    queryClient.invalidateQueries({ queryKey: ['admin-pages'] });
    queryClient.invalidateQueries({ queryKey: ['admin-page-detail'] });
    queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
    queryClient.invalidateQueries({ queryKey: ['admin-services'] });
    queryClient.invalidateQueries({ queryKey: ['admin-gallery'] });
    queryClient.invalidateQueries({ queryKey: ['admin-media'] });
    queryClient.invalidateQueries({ queryKey: ['admin-testimonials'] });
    queryClient.invalidateQueries({ queryKey: ['admin-blog'] });
    queryClient.invalidateQueries({ queryKey: ['admin-enquiries'] });
    queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
    queryClient.invalidateQueries({ queryKey: ['admin-users-rbac'] });
  };

  // Universal File Upload Handler (supports 1 to 50+ files)
  const handleBulkMediaUpload = async (
    files: FileList | null,
    category = 'Interior Portfolio',
    onUploaded?: (assets: any[]) => void
  ) => {
    if (!files || files.length === 0) return;
    setUploadingFiles(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach((f) => formData.append('files', f));
      formData.append('category', category);

      const uploaded = await apiFetch<any[]>('/media/upload', {
        method: 'POST',
        body: formData,
      });

      showToast(`Uploaded ${uploaded.length} media file(s) to cloud storage!`);
      invalidateAll();
      if (onUploaded) onUploaded(uploaded);
    } catch (err: any) {
      showToast(err.message || 'Upload failed', false);
    } finally {
      setUploadingFiles(false);
    }
  };

  // ============================================================================
  // STATE FOR MODULE FORMS
  // ============================================================================

  // Page creation / Section editing state
  const [newPageModal, setNewPageModal] = useState(false);
  const [newPageForm, setNewPageForm] = useState({
    title: '',
    slug: '',
    description: '',
    bannerImage:
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1920&q=85',
    status: 'published',
  });
  const [editingSection, setEditingSection] = useState<any | null>(null);
  const [newSectionModal, setNewSectionModal] = useState(false);
  const [newSectionForm, setNewSectionForm] = useState({
    blockType: 'image-text-split',
    eyebrow: 'FEATURED HIGHLIGHT',
    title: '',
    subtitle: '',
    content: '',
    mediaUrl:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=85',
    ctaPrimaryText: 'Book Consultation',
    ctaPrimaryLink: '/contact',
  });

  // Project Editor State
  const [editingProject, setEditingProject] = useState<any | null>(null);
  const [newImageUrlInput, setNewImageUrlInput] = useState('');
  const [newImageCaptionInput, setNewImageCaptionInput] = useState('');

  // Service Editor State
  const [editingService, setEditingService] = useState<any | null>(null);

  // Gallery Album Editor State
  const [editingAlbum, setEditingAlbum] = useState<any | null>(null);

  // Testimonial Editor State
  const [editingTestimonial, setEditingTestimonial] = useState<any | null>(null);

  // Blog Post Editor State
  const [editingBlog, setEditingBlog] = useState<any | null>(null);

  // Enquiry Note Modal State
  const [selectedEnquiry, setSelectedEnquiry] = useState<any | null>(null);
  const [enquiryNoteInput, setEnquiryNoteInput] = useState('');

  // Settings Form State
  const [settingsForm, setSettingsForm] = useState<any>(null);
  useEffect(() => {
    if (globalSettings && !settingsForm) {
      setSettingsForm(globalSettings);
    }
  }, [globalSettings, settingsForm]);

  // New User Form State
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    password: '',
    roleName: 'Content Manager',
    designation: '',
  });

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[#070F19] text-white flex items-center justify-center">
        <div className="text-gold text-xs uppercase tracking-[0.25em] animate-pulse">
          Initializing Vision Tech Solutions CMS...
        </div>
      </div>
    );
  }

  const stats = dashData?.stats || {
    totalProjects: 0,
    totalServices: 0,
    totalGalleryImages: 0,
    totalEnquiries: 0,
    newEnquiries: 0,
    publishedPages: 0,
    draftPages: 0,
  };

  const projectsList = projectsData?.projects || [];
  const albumsList = galleryData?.albums || [];
  const blogPostsList = blogData?.posts || [];
  const sectionsList = selectedPageDetail?.sections || [];

  // Section Reorder Handler
  const handleMoveSection = async (index: number, direction: -1 | 1) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= sectionsList.length) return;
    const cloned = [...sectionsList];
    const temp = cloned[index];
    cloned[index] = cloned[targetIdx];
    cloned[targetIdx] = temp;

    const orderedIds = cloned.map((s, idx) => ({
      id: s._id,
      order: idx + 1,
      isEnabled: s.isEnabled,
    }));

    try {
      await apiFetch(`/pages/${selectedPageSlug}/reorder-sections`, {
        method: 'PUT',
        body: JSON.stringify({ orderedIds }),
      });
      showToast('Updated section order on live page!');
      refetchPageDetail();
      invalidateAll();
    } catch (err: any) {
      showToast(err.message, false);
    }
  };

  // Toggle Section Visibility
  const handleToggleSection = async (sec: any) => {
    try {
      await apiFetch(`/pages/sections/${sec._id}`, {
        method: 'PUT',
        body: JSON.stringify({ isEnabled: !sec.isEnabled }),
      });
      showToast(
        `${sec.title} ${!sec.isEnabled ? 'enabled' : 'hidden'} on ${selectedPageSlug} page.`
      );
      refetchPageDetail();
      invalidateAll();
    } catch (err: any) {
      showToast(err.message, false);
    }
  };

  // CSV Download Handler
  const handleExportEnquiriesCsv = async () => {
    try {
      const token = localStorage.getItem('vts_admin_token');
      const res = await fetch(`${API_BASE_URL}/enquiries/export/csv`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vision-tech-enquiries-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      showToast('Exported enquiries to CSV!');
    } catch {
      showToast('CSV export failed', false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070F19] text-white flex flex-col lg:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-64 bg-[#0B1623] border-b lg:border-b-0 lg:border-r border-white/10 shrink-0 flex flex-col justify-between">
        <div>
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <BrandLogo />
          </div>

          {/* Current Logged-in Role Badge */}
          <div className="px-5 py-3.5 bg-white/[0.02] border-b border-white/10">
            <div className="text-xs font-semibold text-white truncate">{user.name}</div>
            <div className="text-[11px] text-gold font-medium flex items-center gap-1 mt-0.5">
              <Shield className="w-3 h-3" /> {user.roleName}
            </div>
          </div>

          <nav className="p-3 space-y-1 flex lg:flex-col overflow-x-auto">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'pages', label: 'Pages & Home Layout', icon: FileText },
              { id: 'projects', label: 'Projects Portfolio', icon: FolderKanban },
              { id: 'services', label: 'Services (8+)', icon: Briefcase },
              { id: 'gallery', label: 'Gallery & Media CDN', icon: ImageIcon },
              { id: 'testimonials', label: 'Testimonials', icon: MessageSquareQuote },
              {
                id: 'enquiries',
                label: `Enquiries (${stats.newEnquiries} New)`,
                icon: Inbox,
              },
              { id: 'seo', label: 'SEO & Sitemap', icon: Globe },
              { id: 'settings', label: 'Website Settings', icon: Settings },
              { id: 'users', label: 'Users & RBAC Roles', icon: Users },
            ].map((item) => {
              const IconComp = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as AdminTab)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all w-full text-left ${
                    active
                      ? 'bg-gradient-to-r from-[#D4A853] to-[#E2BC6B] text-navy-950 font-semibold shadow-md'
                      : 'text-white/75 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <IconComp className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="hidden lg:block p-4 border-t border-white/10 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="w-full py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-white/85 flex items-center justify-center gap-2"
          >
            <span>View Live Website</span>
            <ExternalLink className="w-3.5 h-3.5 text-gold" />
          </Link>
          <button
            onClick={() => {
              logout();
              router.push('/admin/login');
            }}
            className="w-full py-2.5 px-3 rounded-xl border border-rose-500/30 hover:bg-rose-950/60 text-xs text-rose-300 flex items-center justify-center gap-2"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="bg-[#0B1623]/80 backdrop-blur-md border-b border-white/10 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-medium text-white capitalize">
              {activeTab === 'pages'
                ? 'Page Builder & Homepage Section Manager'
                : activeTab === 'seo'
                ? 'SEO & Structured Metadata Center'
                : `${activeTab} Management`}
            </h1>
            <p className="text-xs text-white/55">
              All changes saved here update the live public website and MongoDB database immediately.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {uploadingFiles && (
              <span className="text-xs bg-gold/20 border border-gold text-gold px-3 py-1.5 rounded-full animate-pulse">
                Uploading Media to Storage...
              </span>
            )}
            <Link
              href="/"
              target="_blank"
              className="bg-white/10 hover:bg-white/15 text-white text-xs font-medium px-4 py-2 rounded-lg flex items-center gap-1.5"
            >
              <span>Open Public Site</span>
              <ExternalLink className="w-3.5 h-3.5 text-gold" />
            </Link>
          </div>
        </header>

        {/* Notification Toast */}
        {toast && (
          <div
            className={`mx-6 mt-4 p-3.5 rounded-xl border text-xs flex items-center gap-2.5 shadow-lg ${
              toast.ok
                ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200'
                : 'bg-rose-950/90 border-rose-500/40 text-rose-200'
            }`}
          >
            {toast.ok ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{toast.text}</span>
          </div>
        )}

        <main className="p-6 flex-1 overflow-y-auto space-y-8">
          {/* ================================================================
              TAB 1: ADMIN DASHBOARD
          ================================================================ */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              {/* 7 Key Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
                {[
                  { label: 'Total Projects', value: stats.totalProjects, tab: 'projects' },
                  { label: 'Total Services', value: stats.totalServices, tab: 'services' },
                  { label: 'Gallery Images', value: stats.totalGalleryImages, tab: 'gallery' },
                  { label: 'Total Enquiries', value: stats.totalEnquiries, tab: 'enquiries' },
                  { label: 'New Enquiries', value: stats.newEnquiries, tab: 'enquiries', highlight: true },
                  { label: 'Published Pages', value: stats.publishedPages, tab: 'pages' },
                  { label: 'Draft Pages', value: stats.draftPages, tab: 'pages' },
                ].map((card, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveTab(card.tab as AdminTab)}
                    className={`p-4 rounded-2xl border text-left transition-all hover:border-gold ${
                      card.highlight
                        ? 'bg-gold/15 border-gold/50'
                        : 'bg-[#0B1623] border-white/10'
                    }`}
                  >
                    <div className="font-serif text-3xl font-bold text-white">
                      {card.value}
                    </div>
                    <div className="text-[11px] text-white/65 mt-1">{card.label}</div>
                  </button>
                ))}
              </div>

              {/* Quick Actions Bar */}
              <div className="bg-[#0B1623] border border-white/10 rounded-2xl p-5">
                <div className="text-xs uppercase tracking-widest text-gold font-semibold mb-3">
                  Quick Administrator Actions
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      setSelectedPageSlug('home');
                      setActiveTab('pages');
                    }}
                    className="bg-gold text-navy-950 font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Customize Homepage Sections
                  </button>
                  <button
                    onClick={() => {
                      setEditingProject({
                        title: '',
                        category: 'Villa',
                        projectType: 'Residential',
                        location: 'Bangalore',
                        completionDate: 'October 2026',
                        projectSize: '4,500 Sq. Ft.',
                        shortSummary: '',
                        description: '',
                        designConcept: '',
                        challenges: '',
                        solutions: '',
                        coverImage:
                          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=85',
                        images: [],
                        isFeatured: true,
                        status: 'published',
                      });
                      setActiveTab('projects');
                    }}
                    className="bg-white/10 hover:bg-white/15 text-white text-xs px-4 py-2.5 rounded-xl flex items-center gap-2"
                  >
                    <Plus className="w-3.5 h-3.5 text-gold" /> Add New Project
                  </button>
                  <button
                    onClick={() => {
                      setEditingService({
                        title: '',
                        categoryType: 'Residential',
                        shortDescription: '',
                        heroBanner:
                          'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1920&q=85',
                        cardImage:
                          'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=85',
                        introduction: '',
                        detailedDescription: '',
                        benefits: ['Turnkey design-to-execution accountability'],
                        status: 'published',
                      });
                      setActiveTab('services');
                    }}
                    className="bg-white/10 hover:bg-white/15 text-white text-xs px-4 py-2.5 rounded-xl flex items-center gap-2"
                  >
                    <Plus className="w-3.5 h-3.5 text-gold" /> Add New Service
                  </button>
                  <button
                    onClick={() => setActiveTab('gallery')}
                    className="bg-white/10 hover:bg-white/15 text-white text-xs px-4 py-2.5 rounded-xl flex items-center gap-2"
                  >
                    <Upload className="w-3.5 h-3.5 text-gold" /> Upload Gallery Media
                  </button>
                  <button
                    onClick={handleExportEnquiriesCsv}
                    className="bg-white/10 hover:bg-white/15 text-white text-xs px-4 py-2.5 rounded-xl flex items-center gap-2"
                  >
                    <Download className="w-3.5 h-3.5 text-gold" /> Export Enquiries CSV
                  </button>
                </div>
              </div>

              {/* Latest Enquiries & Recent Activities */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 bg-[#0B1623] border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-serif text-2xl text-white">Latest Client Enquiries</h2>
                    <button
                      onClick={() => setActiveTab('enquiries')}
                      className="text-xs text-gold hover:underline"
                    >
                      Manage All Leads →
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-white/10 text-white/50">
                          <th className="pb-2.5">Client</th>
                          <th className="pb-2.5">Service</th>
                          <th className="pb-2.5">Location</th>
                          <th className="pb-2.5">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {(dashData?.latestEnquiries || []).map((enq: any) => (
                          <tr key={enq._id} className="hover:bg-white/[0.02]">
                            <td className="py-3 font-medium text-white">
                              {enq.name}
                              <div className="text-[11px] text-white/50">{enq.phone}</div>
                            </td>
                            <td className="py-3 text-white/80">{enq.serviceInterestedIn}</td>
                            <td className="py-3 text-white/65">{enq.location || 'Bangalore'}</td>
                            <td className="py-3">
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-gold/20 text-gold">
                                {enq.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="lg:col-span-5 bg-[#0B1623] border border-white/10 rounded-2xl p-6">
                  <h2 className="font-serif text-2xl text-white mb-4">
                    Recent CMS Activity Logs
                  </h2>
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                    {(dashData?.recentActivities || []).map((act: any) => (
                      <div
                        key={act._id}
                        className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-xs"
                      >
                        <div className="flex items-center justify-between text-gold font-medium">
                          <span>{act.action}</span>
                          <span className="text-[10px] text-white/45">{act.module}</span>
                        </div>
                        <div className="text-white/75 mt-0.5">
                          {act.entityTitle ? `${act.entityTitle} — ` : ''}by {act.userName} (
                          {act.userRole})
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================
              TAB 2: PAGE MANAGEMENT & HOMEPAGE SECTION BUILDER
          ================================================================ */}
          {activeTab === 'pages' && (
            <div className="space-y-6">
              {/* Page Selector & Create New Page */}
              <div className="bg-[#0B1623] border border-white/10 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-white/60 mr-2">Select Page:</span>
                  {pagesList.map((p: any) => (
                    <button
                      key={p._id}
                      onClick={() => setSelectedPageSlug(p.slug)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                        selectedPageSlug === p.slug
                          ? 'bg-gold text-navy-950'
                          : 'bg-white/5 text-white/80 hover:bg-white/10'
                      }`}
                    >
                      <span>{p.title}</span>
                      <span className="text-[10px] opacity-70">({p.status})</span>
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => setNewSectionModal(true)}
                    className="bg-white/10 hover:bg-white/15 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5 text-gold" /> Add Section Block
                  </button>
                  <button
                    onClick={() => setNewPageModal(true)}
                    className="bg-gold text-navy-950 font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Create New Page
                  </button>
                </div>
              </div>

              {/* Selected Page Metadata & Status Bar */}
              {selectedPageDetail?.page && (
                <div className="bg-[#0B1623] border border-white/10 rounded-2xl p-6 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <span className="text-[11px] uppercase tracking-widest text-gold font-semibold">
                        PAGE SETTINGS: /{selectedPageDetail.page.slug}
                      </span>
                      <h2 className="font-serif text-2xl text-white">
                        {selectedPageDetail.page.title}
                      </h2>
                    </div>
                    <div className="flex items-center gap-3">
                      <select
                        value={selectedPageDetail.page.status}
                        onChange={async (e) => {
                          await apiFetch(`/pages/${selectedPageDetail.page._id}`, {
                            method: 'PUT',
                            body: JSON.stringify({ status: e.target.value }),
                          });
                          showToast(`Page status updated to ${e.target.value}`);
                          refetchPageDetail();
                          invalidateAll();
                        }}
                        className="bg-navy-950 border border-white/20 rounded-xl px-3.5 py-2 text-xs text-white"
                      >
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                        <option value="scheduled">Scheduled</option>
                      </select>
                      <Link
                        href={
                          selectedPageDetail.page.slug === 'home'
                            ? '/'
                            : `/${selectedPageDetail.page.slug}`
                        }
                        target="_blank"
                        className="bg-white/10 hover:bg-white/15 text-xs px-4 py-2 rounded-xl flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5 text-gold" /> Preview Page
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Ordered Sections List for Selected Page */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-xl text-white">
                    Configurable Page Sections ({sectionsList.length} Blocks)
                  </h3>
                  <span className="text-xs text-white/55">
                    Use Up/Down arrows to reorder sections or toggle switches to enable/disable sections.
                  </span>
                </div>

                {sectionsList.map((sec: any, idx: number) => (
                  <div
                    key={sec._id}
                    className={`bg-[#0B1623] border rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                      sec.isEnabled ? 'border-white/15' : 'border-white/5 opacity-55'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex flex-col items-center gap-1">
                        <button
                          onClick={() => handleMoveSection(idx, -1)}
                          disabled={idx === 0}
                          className="p-1 rounded bg-white/5 hover:bg-white/15 disabled:opacity-30"
                          title="Move Section Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-[11px] font-bold text-gold">#{idx + 1}</span>
                        <button
                          onClick={() => handleMoveSection(idx, 1)}
                          disabled={idx === sectionsList.length - 1}
                          className="p-1 rounded bg-white/5 hover:bg-white/15 disabled:opacity-30"
                          title="Move Section Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-gold/20 text-gold font-semibold">
                            {sec.blockType}
                          </span>
                          {sec.eyebrow && (
                            <span className="text-xs text-white/50">{sec.eyebrow}</span>
                          )}
                        </div>
                        <h4 className="font-serif text-xl text-white mt-1">{sec.title}</h4>
                        {sec.subtitle && (
                          <p className="text-xs text-white/60 line-clamp-1 mt-0.5 max-w-2xl">
                            {sec.subtitle}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 self-end sm:self-center">
                      <button
                        onClick={() => handleToggleSection(sec)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                          sec.isEnabled
                            ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                            : 'bg-white/5 border-white/10 text-white/50'
                        }`}
                      >
                        {sec.isEnabled ? 'Enabled' : 'Disabled'}
                      </button>

                      <button
                        onClick={() => setEditingSection(sec)}
                        className="bg-white/10 hover:bg-gold hover:text-navy-950 text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Edit Content
                      </button>

                      <button
                        onClick={async () => {
                          if (!confirm(`Delete section "${sec.title}"?`)) return;
                          await apiFetch(`/pages/sections/${sec._id}`, {
                            method: 'DELETE',
                          });
                          showToast('Section deleted');
                          refetchPageDetail();
                          invalidateAll();
                        }}
                        className="p-2 rounded-lg bg-rose-950/50 hover:bg-rose-900 text-rose-300"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Edit Section Modal */}
              {editingSection && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="bg-[#0B1623] border border-white/20 rounded-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
                    <h3 className="font-serif text-2xl text-white">
                      Edit Section: {editingSection.title}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-white/70 mb-1">
                          Eyebrow Label
                        </label>
                        <input
                          type="text"
                          value={editingSection.eyebrow || ''}
                          onChange={(e) =>
                            setEditingSection({ ...editingSection, eyebrow: e.target.value })
                          }
                          className="w-full bg-navy-950 border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-white/70 mb-1">
                          Main Headline
                        </label>
                        <input
                          type="text"
                          value={editingSection.title || ''}
                          onChange={(e) =>
                            setEditingSection({ ...editingSection, title: e.target.value })
                          }
                          className="w-full bg-navy-950 border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-white/70 mb-1">
                        Subtitle / Description
                      </label>
                      <textarea
                        rows={3}
                        value={editingSection.subtitle || ''}
                        onChange={(e) =>
                          setEditingSection({ ...editingSection, subtitle: e.target.value })
                        }
                        className="w-full bg-navy-950 border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-white/70 mb-1">
                          Background / Feature Image URL
                        </label>
                        <input
                          type="text"
                          value={editingSection.mediaUrl || ''}
                          onChange={(e) =>
                            setEditingSection({ ...editingSection, mediaUrl: e.target.value })
                          }
                          className="w-full bg-navy-950 border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-white/70 mb-1">
                          Upload New Image From Device
                        </label>
                        <input
                          type="file"
                          accept="image/*,video/*"
                          onChange={(e) =>
                            handleBulkMediaUpload(e.target.files, 'Page Sections', (assets) => {
                              if (assets[0]) {
                                setEditingSection({
                                  ...editingSection,
                                  mediaUrl: assets[0].secureUrl,
                                });
                              }
                            })
                          }
                          className="w-full text-xs text-white/70"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-white/70 mb-1">
                          Primary CTA Button Text
                        </label>
                        <input
                          type="text"
                          value={editingSection.ctaPrimaryText || ''}
                          onChange={(e) =>
                            setEditingSection({
                              ...editingSection,
                              ctaPrimaryText: e.target.value,
                            })
                          }
                          className="w-full bg-navy-950 border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-white/70 mb-1">
                          Primary CTA Link
                        </label>
                        <input
                          type="text"
                          value={editingSection.ctaPrimaryLink || ''}
                          onChange={(e) =>
                            setEditingSection({
                              ...editingSection,
                              ctaPrimaryLink: e.target.value,
                            })
                          }
                          className="w-full bg-navy-950 border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                      <button
                        onClick={() => setEditingSection(null)}
                        className="px-4 py-2 rounded-xl border border-white/20 text-xs"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={async () => {
                          await apiFetch(`/pages/sections/${editingSection._id}`, {
                            method: 'PUT',
                            body: JSON.stringify(editingSection),
                          });
                          showToast('Section updated successfully!');
                          setEditingSection(null);
                          refetchPageDetail();
                          invalidateAll();
                        }}
                        className="bg-gold text-navy-950 font-semibold px-6 py-2 rounded-xl text-xs"
                      >
                        Save Section Changes
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Add Section Block Modal */}
              {newSectionModal && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="bg-[#0B1623] border border-white/20 rounded-2xl max-w-xl w-full p-6 space-y-4">
                    <h3 className="font-serif text-2xl text-white">
                      Add Content Section Block to /{selectedPageSlug}
                    </h3>
                    <div>
                      <label className="block text-xs text-white/70 mb-1">Block Type</label>
                      <select
                        value={newSectionForm.blockType}
                        onChange={(e) =>
                          setNewSectionForm({ ...newSectionForm, blockType: e.target.value })
                        }
                        className="w-full bg-navy-950 border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white"
                      >
                        <option value="image-text-split">Image & Text Split Section</option>
                        <option value="text">Rich Text Section</option>
                        <option value="full-width-image">Full-Width Architectural Image</option>
                        <option value="our-process">Our Design Process Block</option>
                        <option value="featured-projects">Featured Projects Showcase</option>
                        <option value="testimonials">Client Testimonials Carousel</option>
                        <option value="consultation-cta">Consultation Enquiry CTA</option>
                      </select>
                    </div>
                    <input
                      type="text"
                      placeholder="Eyebrow (e.g. BESPOKE ARCHITECTURE)"
                      value={newSectionForm.eyebrow}
                      onChange={(e) =>
                        setNewSectionForm({ ...newSectionForm, eyebrow: e.target.value })
                      }
                      className="w-full bg-navy-950 border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white"
                    />
                    <input
                      type="text"
                      placeholder="Section Headline *"
                      value={newSectionForm.title}
                      onChange={(e) =>
                        setNewSectionForm({ ...newSectionForm, title: e.target.value })
                      }
                      className="w-full bg-navy-950 border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white"
                    />
                    <textarea
                      rows={3}
                      placeholder="Subtitle / Description"
                      value={newSectionForm.subtitle}
                      onChange={(e) =>
                        setNewSectionForm({ ...newSectionForm, subtitle: e.target.value })
                      }
                      className="w-full bg-navy-950 border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white"
                    />
                    <input
                      type="text"
                      placeholder="Image URL (Optional)"
                      value={newSectionForm.mediaUrl}
                      onChange={(e) =>
                        setNewSectionForm({ ...newSectionForm, mediaUrl: e.target.value })
                      }
                      className="w-full bg-navy-950 border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white"
                    />
                    <div className="flex justify-end gap-3 pt-3">
                      <button
                        onClick={() => setNewSectionModal(false)}
                        className="px-4 py-2 rounded-xl border border-white/20 text-xs"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={async () => {
                          if (!newSectionForm.title) return;
                          await apiFetch(`/pages/${selectedPageSlug}/sections`, {
                            method: 'POST',
                            body: JSON.stringify(newSectionForm),
                          });
                          showToast('Added new section block!');
                          setNewSectionModal(false);
                          refetchPageDetail();
                          invalidateAll();
                        }}
                        className="bg-gold text-navy-950 font-semibold px-5 py-2 rounded-xl text-xs"
                      >
                        Add Section Block
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Create New Page Modal */}
              {newPageModal && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="bg-[#0B1623] border border-white/20 rounded-2xl max-w-lg w-full p-6 space-y-4">
                    <h3 className="font-serif text-2xl text-white">Create New Dynamic Page</h3>
                    <input
                      type="text"
                      placeholder="Page Title (e.g. Turnkey Contracting)"
                      value={newPageForm.title}
                      onChange={(e) =>
                        setNewPageForm({ ...newPageForm, title: e.target.value })
                      }
                      className="w-full bg-navy-950 border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white"
                    />
                    <input
                      type="text"
                      placeholder="Custom URL Slug (optional, auto-generated)"
                      value={newPageForm.slug}
                      onChange={(e) =>
                        setNewPageForm({ ...newPageForm, slug: e.target.value })
                      }
                      className="w-full bg-navy-950 border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white"
                    />
                    <textarea
                      rows={3}
                      placeholder="Page Banner Description"
                      value={newPageForm.description}
                      onChange={(e) =>
                        setNewPageForm({ ...newPageForm, description: e.target.value })
                      }
                      className="w-full bg-navy-950 border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white"
                    />
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => setNewPageModal(false)}
                        className="px-4 py-2 rounded-xl border border-white/20 text-xs"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={async () => {
                          if (!newPageForm.title) return;
                          const created = await apiFetch<any>('/pages', {
                            method: 'POST',
                            body: JSON.stringify(newPageForm),
                          });
                          showToast(`Created page /${created.slug}`);
                          setNewPageModal(false);
                          setSelectedPageSlug(created.slug);
                          invalidateAll();
                        }}
                        className="bg-gold text-navy-950 font-semibold px-5 py-2 rounded-xl text-xs"
                      >
                        Create Page
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================================================================
              TAB 3: PROJECTS PORTFOLIO MANAGEMENT
          ================================================================ */}
          {activeTab === 'projects' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-2xl text-white">
                  Portfolio Projects ({projectsList.length})
                </h2>
                <button
                  onClick={() =>
                    setEditingProject({
                      title: '',
                      category: 'Villa',
                      projectType: 'Residential',
                      location: 'Bangalore',
                      completionDate: 'October 2026',
                      clientName: '',
                      projectSize: '5,000 Sq. Ft.',
                      shortSummary: '',
                      description: '',
                      designConcept: '',
                      challenges: '',
                      solutions: '',
                      coverImage:
                        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=85',
                      images: [],
                      beforeAfterImages: [],
                      videos: [],
                      isFeatured: true,
                      status: 'published',
                    })
                  }
                  className="bg-gold text-navy-950 font-semibold text-xs px-5 py-2.5 rounded-xl flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add New Project
                </button>
              </div>

              {/* Project Editor Form */}
              {editingProject && (
                <div className="bg-[#0B1623] border border-gold/40 rounded-2xl p-6 space-y-5">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <h3 className="font-serif text-2xl text-gold">
                      {editingProject._id ? `Edit Project: ${editingProject.title}` : 'Create New Portfolio Project'}
                    </h3>
                    <button
                      onClick={() => setEditingProject(null)}
                      className="text-xs text-white/60 hover:text-white"
                    >
                      Close Editor ✕
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-white/70 mb-1">Project Name *</label>
                      <input
                        type="text"
                        value={editingProject.title}
                        onChange={(e) =>
                          setEditingProject({ ...editingProject, title: e.target.value })
                        }
                        className="w-full bg-navy-950 border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-white/70 mb-1">Category *</label>
                      <select
                        value={editingProject.category}
                        onChange={(e) =>
                          setEditingProject({ ...editingProject, category: e.target.value })
                        }
                        className="w-full bg-navy-950 border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white"
                      >
                        {PROJECT_CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-white/70 mb-1">Project Type *</label>
                      <select
                        value={editingProject.projectType}
                        onChange={(e) =>
                          setEditingProject({ ...editingProject, projectType: e.target.value })
                        }
                        className="w-full bg-navy-950 border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white"
                      >
                        <option value="Residential">Residential</option>
                        <option value="Commercial">Commercial</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs text-white/70 mb-1">Location *</label>
                      <input
                        type="text"
                        value={editingProject.location}
                        onChange={(e) =>
                          setEditingProject({ ...editingProject, location: e.target.value })
                        }
                        className="w-full bg-navy-950 border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-white/70 mb-1">Completion Date</label>
                      <input
                        type="text"
                        value={editingProject.completionDate}
                        onChange={(e) =>
                          setEditingProject({
                            ...editingProject,
                            completionDate: e.target.value,
                          })
                        }
                        className="w-full bg-navy-950 border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-white/70 mb-1">Project Size</label>
                      <input
                        type="text"
                        value={editingProject.projectSize || ''}
                        onChange={(e) =>
                          setEditingProject({ ...editingProject, projectSize: e.target.value })
                        }
                        className="w-full bg-navy-950 border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-white/70 mb-1">Client Name</label>
                      <input
                        type="text"
                        value={editingProject.clientName || ''}
                        onChange={(e) =>
                          setEditingProject({ ...editingProject, clientName: e.target.value })
                        }
                        className="w-full bg-navy-950 border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-white/70 mb-1">
                        Short Summary
                      </label>
                      <textarea
                        rows={2}
                        value={editingProject.shortSummary || ''}
                        onChange={(e) =>
                          setEditingProject({ ...editingProject, shortSummary: e.target.value })
                        }
                        className="w-full bg-navy-950 border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-white/70 mb-1">
                        Design Concept
                      </label>
                      <textarea
                        rows={2}
                        value={editingProject.designConcept || ''}
                        onChange={(e) =>
                          setEditingProject({
                            ...editingProject,
                            designConcept: e.target.value,
                          })
                        }
                        className="w-full bg-navy-950 border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-white/70 mb-1">
                      Detailed Project Description *
                    </label>
                    <textarea
                      rows={3}
                      value={editingProject.description || ''}
                      onChange={(e) =>
                        setEditingProject({ ...editingProject, description: e.target.value })
                      }
                      className="w-full bg-navy-950 border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white"
                    />
                  </div>

                  {/* Cover Image & Bulk Multi-Image Upload */}
                  <div className="p-4 rounded-xl bg-navy-950 border border-white/10 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <div className="text-xs font-semibold text-gold">
                          Project Photographs ({editingProject.images?.length || 0} images) — Supports 5, 20, 50+ bulk uploads
                        </div>
                        <div className="text-[11px] text-white/55">
                          Upload multiple high-res photos directly or add image URLs below.
                        </div>
                      </div>
                      <label className="cursor-pointer bg-gold text-navy-950 font-semibold text-xs px-4 py-2 rounded-xl flex items-center gap-2">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Bulk Upload Photos</span>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            handleBulkMediaUpload(
                              e.target.files,
                              editingProject.category || 'Portfolio',
                              (uploadedAssets) => {
                                const newPhotos = uploadedAssets.map((a, i) => ({
                                  url: a.secureUrl,
                                  thumbnailUrl: a.thumbnailUrl,
                                  caption: a.title,
                                  order: (editingProject.images?.length || 0) + i + 1,
                                }));
                                setEditingProject({
                                  ...editingProject,
                                  coverImage:
                                    editingProject.coverImage || newPhotos[0]?.url || '',
                                  images: [...(editingProject.images || []), ...newPhotos],
                                });
                              }
                            )
                          }
                        />
                      </label>
                    </div>

                    {/* Add Photo by URL */}
                    <div className="flex flex-wrap gap-2">
                      <input
                        type="text"
                        placeholder="Paste image URL..."
                        value={newImageUrlInput}
                        onChange={(e) => setNewImageUrlInput(e.target.value)}
                        className="flex-1 bg-[#0B1623] border border-white/20 rounded-lg px-3 py-2 text-xs text-white"
                      />
                      <input
                        type="text"
                        placeholder="Image caption..."
                        value={newImageCaptionInput}
                        onChange={(e) => setNewImageCaptionInput(e.target.value)}
                        className="w-64 bg-[#0B1623] border border-white/20 rounded-lg px-3 py-2 text-xs text-white"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!newImageUrlInput.trim()) return;
                          const next = [
                            ...(editingProject.images || []),
                            {
                              url: newImageUrlInput.trim(),
                              caption: newImageCaptionInput || editingProject.title,
                              order: (editingProject.images?.length || 0) + 1,
                            },
                          ];
                          setEditingProject({ ...editingProject, images: next });
                          setNewImageUrlInput('');
                          setNewImageCaptionInput('');
                        }}
                        className="bg-white/10 hover:bg-white/20 text-xs px-4 py-2 rounded-lg"
                      >
                        + Add Photo
                      </button>
                    </div>

                    {/* Photo Grid with Set Cover & Reorder */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                      {(editingProject.images || []).map((img: any, idx: number) => (
                        <div
                          key={idx}
                          className="bg-[#0B1623] border border-white/15 rounded-xl overflow-hidden p-2 space-y-1.5"
                        >
                          <img
                            src={img.url}
                            alt={img.caption || ''}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <input
                            type="text"
                            value={img.caption || ''}
                            onChange={(e) => {
                              const imgs = [...editingProject.images];
                              imgs[idx] = { ...imgs[idx], caption: e.target.value };
                              setEditingProject({ ...editingProject, images: imgs });
                            }}
                            placeholder="Caption..."
                            className="w-full bg-navy-950 border border-white/10 rounded px-2 py-1 text-[10px] text-white"
                          />
                          <div className="flex items-center justify-between text-[10px]">
                            <button
                              type="button"
                              onClick={() =>
                                setEditingProject({ ...editingProject, coverImage: img.url })
                              }
                              className={`px-1.5 py-0.5 rounded ${
                                editingProject.coverImage === img.url
                                  ? 'bg-gold text-navy-950 font-bold'
                                  : 'bg-white/10 text-white/70'
                              }`}
                            >
                              {editingProject.coverImage === img.url ? 'Cover ★' : 'Set Cover'}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const imgs = editingProject.images.filter(
                                  (_: any, i: number) => i !== idx
                                );
                                setEditingProject({ ...editingProject, images: imgs });
                              }}
                              className="text-rose-400 hover:underline"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Status & Featured Toggles + Save */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-white/10">
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(editingProject.isFeatured)}
                          onChange={(e) =>
                            setEditingProject({
                              ...editingProject,
                              isFeatured: e.target.checked,
                            })
                          }
                        />
                        <span>Feature on Homepage (&ldquo;Our Latest Work&rdquo;)</span>
                      </label>

                      <select
                        value={editingProject.status || 'published'}
                        onChange={(e) =>
                          setEditingProject({ ...editingProject, status: e.target.value })
                        }
                        className="bg-navy-950 border border-white/20 rounded-xl px-3 py-1.5 text-xs text-white"
                      >
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setEditingProject(null)}
                        className="px-4 py-2 rounded-xl border border-white/20 text-xs"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            if (editingProject._id) {
                              await apiFetch(`/projects/${editingProject._id}`, {
                                method: 'PUT',
                                body: JSON.stringify(editingProject),
                              });
                              showToast('Project updated successfully!');
                            } else {
                              await apiFetch('/projects', {
                                method: 'POST',
                                body: JSON.stringify(editingProject),
                              });
                              showToast('New project published!');
                            }
                            setEditingProject(null);
                            invalidateAll();
                          } catch (err: any) {
                            showToast(err.message, false);
                          }
                        }}
                        className="bg-gold text-navy-950 font-semibold px-6 py-2.5 rounded-xl text-xs"
                      >
                        Save & Publish Project
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Projects Table */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {projectsList.map((proj: any) => (
                  <div
                    key={proj._id}
                    className="bg-[#0B1623] border border-white/10 rounded-2xl overflow-hidden flex flex-col justify-between"
                  >
                    <div className="relative h-44">
                      <img
                        src={proj.coverImage}
                        alt={proj.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3 flex gap-1.5">
                        <span className="bg-navy-950/90 text-gold text-[10px] font-semibold px-2.5 py-0.5 rounded-full">
                          {proj.category}
                        </span>
                        {proj.isFeatured && (
                          <span className="bg-gold text-navy-950 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Featured
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="p-4 space-y-3">
                      <div>
                        <div className="text-[11px] text-white/50">
                          {proj.location} • {proj.images?.length || 1} photos
                        </div>
                        <h3 className="font-serif text-xl text-white font-medium">
                          {proj.title}
                        </h3>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-white/10">
                        <button
                          onClick={() => setEditingProject(proj)}
                          className="text-xs text-gold hover:underline flex items-center gap-1"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> Edit
                        </button>
                        <Link
                          href={`/projects/${proj.slug}?preview=true`}
                          target="_blank"
                          className="text-xs text-white/65 hover:text-white flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" /> View
                        </Link>
                        <button
                          onClick={async () => {
                            if (!confirm(`Delete project "${proj.title}"?`)) return;
                            await apiFetch(`/projects/${proj._id}`, { method: 'DELETE' });
                            showToast('Project deleted');
                            invalidateAll();
                          }}
                          className="text-xs text-rose-400 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================================================================
              TAB 4: SERVICES MANAGEMENT
          ================================================================ */}
          {activeTab === 'services' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-2xl text-white">
                    Interior Design & Contracting Services ({servicesList.length})
                  </h2>
                  <p className="text-xs text-white/55">
                    Add unlimited new services or edit the 8 core residential & commercial verticals.
                  </p>
                </div>
                <button
                  onClick={() =>
                    setEditingService({
                      title: '',
                      categoryType: 'Commercial',
                      shortDescription: '',
                      heroBanner:
                        'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&q=85',
                      cardImage:
                        'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=900&q=85',
                      introduction: '',
                      detailedDescription: '',
                      benefits: [
                        'Single-point turnkey accountability',
                        'Guaranteed on-time completion',
                      ],
                      status: 'published',
                    })
                  }
                  className="bg-gold text-navy-950 font-semibold text-xs px-5 py-2.5 rounded-xl flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add New Service
                </button>
              </div>

              {editingService && (
                <div className="bg-[#0B1623] border border-gold/40 rounded-2xl p-6 space-y-4">
                  <h3 className="font-serif text-2xl text-gold">
                    {editingService._id
                      ? `Edit Service: ${editingService.title}`
                      : 'Create New Service Page'}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <input
                      type="text"
                      placeholder="Service Title *"
                      value={editingService.title}
                      onChange={(e) =>
                        setEditingService({ ...editingService, title: e.target.value })
                      }
                      className="bg-navy-950 border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white"
                    />
                    <select
                      value={editingService.categoryType}
                      onChange={(e) =>
                        setEditingService({
                          ...editingService,
                          categoryType: e.target.value,
                        })
                      }
                      className="bg-navy-950 border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white"
                    >
                      <option value="Residential">Residential</option>
                      <option value="Commercial">Commercial</option>
                    </select>
                    <select
                      value={editingService.status || 'published'}
                      onChange={(e) =>
                        setEditingService({ ...editingService, status: e.target.value })
                      }
                      className="bg-navy-950 border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white"
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>

                  <input
                    type="text"
                    placeholder="Short Card Description *"
                    value={editingService.shortDescription || ''}
                    onChange={(e) =>
                      setEditingService({
                        ...editingService,
                        shortDescription: e.target.value,
                      })
                    }
                    className="w-full bg-navy-950 border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Hero Banner Image URL"
                      value={editingService.heroBanner || ''}
                      onChange={(e) =>
                        setEditingService({ ...editingService, heroBanner: e.target.value })
                      }
                      className="bg-navy-950 border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white"
                    />
                    <input
                      type="text"
                      placeholder="Card Thumbnail URL"
                      value={editingService.cardImage || ''}
                      onChange={(e) =>
                        setEditingService({ ...editingService, cardImage: e.target.value })
                      }
                      className="bg-navy-950 border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white"
                    />
                  </div>

                  <textarea
                    rows={2}
                    placeholder="Service Introduction Headline"
                    value={editingService.introduction || ''}
                    onChange={(e) =>
                      setEditingService({ ...editingService, introduction: e.target.value })
                    }
                    className="w-full bg-navy-950 border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white"
                  />

                  <textarea
                    rows={4}
                    placeholder="Detailed Service Description"
                    value={editingService.detailedDescription || ''}
                    onChange={(e) =>
                      setEditingService({
                        ...editingService,
                        detailedDescription: e.target.value,
                      })
                    }
                    className="w-full bg-navy-950 border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white"
                  />

                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setEditingService(null)}
                      className="px-4 py-2 rounded-xl border border-white/20 text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={async () => {
                        if (editingService._id) {
                          await apiFetch(`/services/${editingService._id}`, {
                            method: 'PUT',
                            body: JSON.stringify(editingService),
                          });
                          showToast('Service updated!');
                        } else {
                          await apiFetch('/services', {
                            method: 'POST',
                            body: JSON.stringify(editingService),
                          });
                          showToast('New service page created!');
                        }
                        setEditingService(null);
                        invalidateAll();
                      }}
                      className="bg-gold text-navy-950 font-semibold px-6 py-2 rounded-xl text-xs"
                    >
                      Save Service
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {servicesList.map((srv: any) => (
                  <div
                    key={srv._id}
                    className="bg-[#0B1623] border border-white/10 rounded-2xl overflow-hidden flex flex-col justify-between"
                  >
                    <img
                      src={srv.cardImage || srv.heroBanner}
                      alt={srv.title}
                      className="w-full h-40 object-cover"
                    />
                    <div className="p-4 space-y-3">
                      <div>
                        <span className="text-[10px] uppercase tracking-widest text-gold">
                          {srv.categoryType} • {srv.status}
                        </span>
                        <h3 className="font-serif text-xl text-white mt-0.5">{srv.title}</h3>
                        <p className="text-xs text-white/60 line-clamp-2 mt-1">
                          {srv.shortDescription}
                        </p>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
                        <button
                          onClick={() => setEditingService(srv)}
                          className="text-gold hover:underline flex items-center gap-1"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> Edit
                        </button>
                        <Link
                          href={`/services/${srv.slug}`}
                          target="_blank"
                          className="text-white/70 hover:text-white flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" /> Live Page
                        </Link>
                        <button
                          onClick={async () => {
                            if (!confirm(`Delete service "${srv.title}"?`)) return;
                            await apiFetch(`/services/${srv._id}`, { method: 'DELETE' });
                            showToast('Service deleted');
                            invalidateAll();
                          }}
                          className="text-rose-400 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================================================================
              TAB 5: GALLERY ALBUMS & CLOUDINARY / CDN MEDIA LIBRARY
          ================================================================ */}
          {activeTab === 'gallery' && (
            <div className="space-y-8">
              {/* Bulk Upload Dropzone */}
              <div className="bg-[#0B1623] border-2 border-dashed border-gold/40 rounded-2xl p-8 text-center space-y-3">
                <Upload className="w-8 h-8 text-gold mx-auto" />
                <h3 className="font-serif text-2xl text-white">
                  Upload High-Resolution Images or Videos to Media Library
                </h3>
                <p className="text-xs text-white/60 max-w-xl mx-auto">
                  Supports JPG, PNG, WebP, AVIF, MP4, WebM. Uploaded assets are automatically optimized and available for reuse across Pages, Projects, and Gallery Albums without duplication.
                </p>
                <div className="pt-2">
                  <label className="cursor-pointer bg-gold hover:bg-gold-light text-navy-950 font-semibold text-xs px-6 py-3 rounded-full inline-flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    <span>Select Files to Upload</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      className="hidden"
                      onChange={(e) => handleBulkMediaUpload(e.target.files, 'Gallery')}
                    />
                  </label>
                </div>
              </div>

              {/* Gallery Albums Manager */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-2xl text-white">
                    Gallery Albums ({albumsList.length})
                  </h3>
                  <button
                    onClick={() =>
                      setEditingAlbum({
                        title: '',
                        category: 'Residential',
                        description: '',
                        coverImage:
                          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=85',
                        items: [],
                        status: 'published',
                      })
                    }
                    className="bg-white/10 hover:bg-white/15 text-xs px-4 py-2 rounded-xl flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5 text-gold" /> Create Gallery Album
                  </button>
                </div>

                {editingAlbum && (
                  <div className="bg-[#0B1623] border border-gold/40 rounded-2xl p-6 space-y-4">
                    <h4 className="font-serif text-xl text-gold">
                      {editingAlbum._id ? `Edit Album: ${editingAlbum.title}` : 'New Gallery Album'}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Album Title *"
                        value={editingAlbum.title}
                        onChange={(e) =>
                          setEditingAlbum({ ...editingAlbum, title: e.target.value })
                        }
                        className="bg-navy-950 border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white"
                      />
                      <input
                        type="text"
                        placeholder="Category (e.g. Residential, Villa, Commercial)"
                        value={editingAlbum.category}
                        onChange={(e) =>
                          setEditingAlbum({ ...editingAlbum, category: e.target.value })
                        }
                        className="bg-navy-950 border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white"
                      />
                    </div>
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => setEditingAlbum(null)}
                        className="px-4 py-2 rounded-xl border border-white/20 text-xs"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={async () => {
                          if (editingAlbum._id) {
                            await apiFetch(`/gallery/${editingAlbum._id}`, {
                              method: 'PUT',
                              body: JSON.stringify(editingAlbum),
                            });
                          } else {
                            await apiFetch('/gallery', {
                              method: 'POST',
                              body: JSON.stringify(editingAlbum),
                            });
                          }
                          showToast('Gallery album saved!');
                          setEditingAlbum(null);
                          invalidateAll();
                        }}
                        className="bg-gold text-navy-950 font-semibold px-5 py-2 rounded-xl text-xs"
                      >
                        Save Album
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {albumsList.map((album: any) => (
                    <div
                      key={album._id}
                      className="bg-[#0B1623] border border-white/10 rounded-2xl p-5 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={album.coverImage}
                          alt={album.title}
                          className="w-20 h-16 rounded-xl object-cover shrink-0"
                        />
                        <div>
                          <span className="text-[10px] uppercase tracking-widest text-gold">
                            {album.category} • {album.items?.length || 0} items
                          </span>
                          <h4 className="font-serif text-xl text-white">{album.title}</h4>
                        </div>
                      </div>
                      <button
                        onClick={() => setEditingAlbum(album)}
                        className="text-xs text-gold hover:underline"
                      >
                        Edit Album
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reusable Media Library Grid */}
              <div className="space-y-4">
                <h3 className="font-serif text-2xl text-white">
                  Media Asset Library ({mediaList.length} Reusable Assets)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                  {mediaList.map((asset: any) => (
                    <div
                      key={asset._id}
                      className="bg-[#0B1623] border border-white/10 rounded-xl overflow-hidden p-2.5 space-y-2"
                    >
                      <img
                        src={asset.thumbnailUrl || asset.secureUrl}
                        alt={asset.altText || asset.title}
                        className="w-full h-28 object-cover rounded-lg"
                      />
                      <div className="text-xs font-medium text-white truncate">
                        {asset.title}
                      </div>
                      <div className="flex items-center justify-between text-[10px]">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(asset.secureUrl);
                            setCopiedUrl(asset._id);
                            setTimeout(() => setCopiedUrl(null), 2000);
                          }}
                          className="text-gold flex items-center gap-1"
                        >
                          {copiedUrl === asset._id ? (
                            <>
                              <Check className="w-3 h-3" /> Copied URL
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" /> Copy URL
                            </>
                          )}
                        </button>
                        <button
                          onClick={async () => {
                            if (!confirm('Delete this media asset?')) return;
                            await apiFetch(`/media/${asset._id}`, { method: 'DELETE' });
                            showToast('Media asset deleted');
                            invalidateAll();
                          }}
                          className="text-rose-400"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================================================================
              TAB 6: TESTIMONIALS MANAGEMENT
          ================================================================ */}
          {activeTab === 'testimonials' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-2xl text-white">
                  Customer Testimonials ({testimonialsList.length})
                </h2>
                <button
                  onClick={() =>
                    setEditingTestimonial({
                      customerName: '',
                      designation: 'Homeowner | Villa',
                      photograph:
                        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
                      reviewContent: '',
                      rating: 5,
                      status: 'published',
                    })
                  }
                  className="bg-gold text-navy-950 font-semibold text-xs px-5 py-2.5 rounded-xl flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add Testimonial
                </button>
              </div>

              {editingTestimonial && (
                <div className="bg-[#0B1623] border border-gold/40 rounded-2xl p-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <input
                      type="text"
                      placeholder="Customer Name *"
                      value={editingTestimonial.customerName}
                      onChange={(e) =>
                        setEditingTestimonial({
                          ...editingTestimonial,
                          customerName: e.target.value,
                        })
                      }
                      className="bg-navy-950 border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white"
                    />
                    <input
                      type="text"
                      placeholder="Designation (e.g. Homemaker | Villa)"
                      value={editingTestimonial.designation}
                      onChange={(e) =>
                        setEditingTestimonial({
                          ...editingTestimonial,
                          designation: e.target.value,
                        })
                      }
                      className="bg-navy-950 border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white"
                    />
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={editingTestimonial.rating}
                      onChange={(e) =>
                        setEditingTestimonial({
                          ...editingTestimonial,
                          rating: Number(e.target.value),
                        })
                      }
                      className="bg-navy-950 border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white"
                    />
                  </div>
                  <textarea
                    rows={3}
                    placeholder="Client Review Content *"
                    value={editingTestimonial.reviewContent}
                    onChange={(e) =>
                      setEditingTestimonial({
                        ...editingTestimonial,
                        reviewContent: e.target.value,
                      })
                    }
                    className="w-full bg-navy-950 border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white"
                  />
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setEditingTestimonial(null)}
                      className="px-4 py-2 rounded-xl border border-white/20 text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={async () => {
                        if (editingTestimonial._id) {
                          await apiFetch(`/testimonials/${editingTestimonial._id}`, {
                            method: 'PUT',
                            body: JSON.stringify(editingTestimonial),
                          });
                        } else {
                          await apiFetch('/testimonials', {
                            method: 'POST',
                            body: JSON.stringify(editingTestimonial),
                          });
                        }
                        showToast('Testimonial saved!');
                        setEditingTestimonial(null);
                        invalidateAll();
                      }}
                      className="bg-gold text-navy-950 font-semibold px-6 py-2 rounded-xl text-xs"
                    >
                      Save Testimonial
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {testimonialsList.map((t: any) => (
                  <div
                    key={t._id}
                    className="bg-[#0B1623] border border-white/10 rounded-2xl p-5 flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        {t.photograph && (
                          <img
                            src={t.photograph}
                            alt={t.customerName}
                            className="w-11 h-11 rounded-full object-cover"
                          />
                        )}
                        <div>
                          <div className="font-serif text-lg text-white font-semibold">
                            {t.customerName}
                          </div>
                          <div className="text-[11px] text-gold">{t.designation}</div>
                        </div>
                      </div>
                      <p className="text-xs text-white/75 italic">&ldquo;{t.reviewContent}&rdquo;</p>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs">
                      <button
                        onClick={() => setEditingTestimonial(t)}
                        className="text-gold hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={async () => {
                          await apiFetch(`/testimonials/${t._id}`, { method: 'DELETE' });
                          showToast('Testimonial deleted');
                          invalidateAll();
                        }}
                        className="text-rose-400 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================================================================
              TAB 7: BLOG & INSIGHTS MANAGEMENT (WITH TIPTAP RICH TEXT EDITOR)
          ================================================================ */}
          {activeTab === 'blog' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-2xl text-white">
                  Journal Articles ({blogPostsList.length})
                </h2>
                <button
                  onClick={() =>
                    setEditingBlog({
                      title: '',
                      excerpt: '',
                      content: '<p>Write your architectural article here...</p>',
                      featuredImage:
                        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=85',
                      category: 'Luxury Residential',
                      tags: ['Interior Design', 'Luxury Villas'],
                      authorName: user.name,
                      authorRole: user.designation || 'Principal Architect',
                      readTimeMinutes: 5,
                      status: 'published',
                    })
                  }
                  className="bg-gold text-navy-950 font-semibold text-xs px-5 py-2.5 rounded-xl flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Write New Article
                </button>
              </div>

              {editingBlog && (
                <div className="bg-[#0B1623] border border-gold/40 rounded-2xl p-6 space-y-4">
                  <h3 className="font-serif text-2xl text-gold">
                    {editingBlog._id ? `Edit Article: ${editingBlog.title}` : 'New Journal Article'}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <input
                      type="text"
                      placeholder="Article Title *"
                      value={editingBlog.title}
                      onChange={(e) =>
                        setEditingBlog({ ...editingBlog, title: e.target.value })
                      }
                      className="sm:col-span-2 bg-navy-950 border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white"
                    />
                    <input
                      type="text"
                      placeholder="Category"
                      value={editingBlog.category}
                      onChange={(e) =>
                        setEditingBlog({ ...editingBlog, category: e.target.value })
                      }
                      className="bg-navy-950 border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Featured Image URL"
                    value={editingBlog.featuredImage}
                    onChange={(e) =>
                      setEditingBlog({ ...editingBlog, featuredImage: e.target.value })
                    }
                    className="w-full bg-navy-950 border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white"
                  />
                  <textarea
                    rows={2}
                    placeholder="Short Excerpt / Summary *"
                    value={editingBlog.excerpt}
                    onChange={(e) =>
                      setEditingBlog({ ...editingBlog, excerpt: e.target.value })
                    }
                    className="w-full bg-navy-950 border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white"
                  />
                  <div>
                    <label className="block text-xs text-white/70 mb-1.5">
                      Rich Text Article Body (TipTap Editor)
                    </label>
                    <RichTextEditor
                      value={editingBlog.content}
                      onChange={(html) => setEditingBlog({ ...editingBlog, content: html })}
                    />
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setEditingBlog(null)}
                      className="px-4 py-2 rounded-xl border border-white/20 text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={async () => {
                        if (editingBlog._id) {
                          await apiFetch(`/blog/${editingBlog._id}`, {
                            method: 'PUT',
                            body: JSON.stringify(editingBlog),
                          });
                        } else {
                          await apiFetch('/blog', {
                            method: 'POST',
                            body: JSON.stringify(editingBlog),
                          });
                        }
                        showToast('Blog article saved!');
                        setEditingBlog(null);
                        invalidateAll();
                      }}
                      className="bg-gold text-navy-950 font-semibold px-6 py-2 rounded-xl text-xs"
                    >
                      Publish Article
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {blogPostsList.map((post: any) => (
                  <div
                    key={post._id}
                    className="bg-[#0B1623] border border-white/10 rounded-2xl overflow-hidden flex flex-col justify-between"
                  >
                    <img
                      src={post.featuredImage}
                      alt={post.title}
                      className="w-full h-40 object-cover"
                    />
                    <div className="p-4 space-y-3">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-gold">
                          {post.category} • {post.status}
                        </span>
                        <h3 className="font-serif text-lg text-white mt-1 line-clamp-2">
                          {post.title}
                        </h3>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
                        <button
                          onClick={() => setEditingBlog(post)}
                          className="text-gold hover:underline"
                        >
                          Edit Article
                        </button>
                        <Link
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          className="text-white/65 hover:text-white"
                        >
                          View
                        </Link>
                        <button
                          onClick={async () => {
                            await apiFetch(`/blog/${post._id}`, { method: 'DELETE' });
                            showToast('Article deleted');
                            invalidateAll();
                          }}
                          className="text-rose-400 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================================================================
              TAB 8: ENQUIRIES & LEAD MANAGEMENT
          ================================================================ */}
          {activeTab === 'enquiries' && (
            <div className="space-y-6">
              <div className="bg-[#0B1623] border border-white/10 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-white/50 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search client name, phone, email..."
                      value={enquirySearch}
                      onChange={(e) => setEnquirySearch(e.target.value)}
                      className="bg-navy-950 border border-white/20 rounded-xl pl-9 pr-3 py-2 text-xs text-white"
                    />
                  </div>
                  <select
                    value={enquiryStatusFilter}
                    onChange={(e) => setEnquiryStatusFilter(e.target.value)}
                    className="bg-navy-950 border border-white/20 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="All">All Statuses</option>
                    {ENQUIRY_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleExportEnquiriesCsv}
                  className="bg-gold text-navy-950 font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2"
                >
                  <Download className="w-3.5 h-3.5" /> Export Leads to CSV
                </button>
              </div>

              <div className="bg-[#0B1623] border border-white/10 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/10 bg-navy-950/60 text-white/60">
                        <th className="p-4">Client Details</th>
                        <th className="p-4">Service & Budget</th>
                        <th className="p-4">Project Requirements</th>
                        <th className="p-4">Assigned To</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {enquiriesList.map((enq: any) => (
                        <tr key={enq._id} className="hover:bg-white/[0.02]">
                          <td className="p-4">
                            <div className="font-semibold text-white text-sm">{enq.name}</div>
                            <div className="text-gold">{enq.phone}</div>
                            <div className="text-white/50">{enq.email}</div>
                            <div className="text-white/50">{enq.location}</div>
                          </td>
                          <td className="p-4">
                            <div className="font-medium text-white">
                              {enq.serviceInterestedIn}
                            </div>
                            <div className="text-white/60">{enq.budgetRange}</div>
                          </td>
                          <td className="p-4 max-w-xs">
                            <p className="text-white/75 line-clamp-2">{enq.projectDetails}</p>
                            {enq.internalNotes?.length > 0 && (
                              <div className="text-[11px] text-gold mt-1">
                                {enq.internalNotes.length} internal note(s)
                              </div>
                            )}
                          </td>
                          <td className="p-4">
                            <input
                              type="text"
                              defaultValue={enq.assignedToName || ''}
                              placeholder="Assign architect..."
                              onBlur={async (e) => {
                                await apiFetch(`/enquiries/${enq._id}`, {
                                  method: 'PUT',
                                  body: JSON.stringify({ assignedToName: e.target.value }),
                                });
                                showToast(`Assigned lead to ${e.target.value || 'Unassigned'}`);
                                invalidateAll();
                              }}
                              className="bg-navy-950 border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-white w-36"
                            />
                          </td>
                          <td className="p-4">
                            <select
                              value={enq.status}
                              onChange={async (e) => {
                                await apiFetch(`/enquiries/${enq._id}`, {
                                  method: 'PUT',
                                  body: JSON.stringify({ status: e.target.value }),
                                });
                                showToast(`Updated lead status to ${e.target.value}`);
                                invalidateAll();
                              }}
                              className="bg-navy-950 border border-gold/40 rounded-lg px-2.5 py-1.5 text-xs text-gold font-semibold"
                            >
                              {ENQUIRY_STATUSES.map((st) => (
                                <option key={st} value={st}>
                                  {st}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="p-4 space-x-2 whitespace-nowrap">
                            <button
                              onClick={() => setSelectedEnquiry(enq)}
                              className="text-gold hover:underline"
                            >
                              Notes ({enq.internalNotes?.length || 0})
                            </button>
                            <button
                              onClick={async () => {
                                if (!confirm(`Delete enquiry from ${enq.name}?`)) return;
                                await apiFetch(`/enquiries/${enq._id}`, { method: 'DELETE' });
                                showToast('Enquiry deleted');
                                invalidateAll();
                              }}
                              className="text-rose-400 hover:underline"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {selectedEnquiry && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="bg-[#0B1623] border border-white/20 rounded-2xl max-w-lg w-full p-6 space-y-4">
                    <h3 className="font-serif text-2xl text-white">
                      Lead Notes: {selectedEnquiry.name}
                    </h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {(selectedEnquiry.internalNotes || []).map((n: any, i: number) => (
                        <div
                          key={i}
                          className="p-3 rounded-xl bg-navy-950 border border-white/10 text-xs"
                        >
                          <div className="text-white/90">{n.note}</div>
                          <div className="text-[10px] text-gold mt-1">
                            By {n.addedBy}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add internal follow-up note..."
                        value={enquiryNoteInput}
                        onChange={(e) => setEnquiryNoteInput(e.target.value)}
                        className="flex-1 bg-navy-950 border border-white/20 rounded-xl px-3.5 py-2 text-xs text-white"
                      />
                      <button
                        onClick={async () => {
                          if (!enquiryNoteInput.trim()) return;
                          const updated = await apiFetch<any>(
                            `/enquiries/${selectedEnquiry._id}`,
                            {
                              method: 'PUT',
                              body: JSON.stringify({ newNote: enquiryNoteInput }),
                            }
                          );
                          setSelectedEnquiry(updated);
                          setEnquiryNoteInput('');
                          showToast('Internal note added');
                          invalidateAll();
                        }}
                        className="bg-gold text-navy-950 font-semibold px-4 py-2 rounded-xl text-xs"
                      >
                        Add Note
                      </button>
                    </div>
                    <div className="flex justify-end">
                      <button
                        onClick={() => setSelectedEnquiry(null)}
                        className="text-xs text-white/60 hover:text-white"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================================================================
              TAB 9: SEO & SITEMAP MANAGEMENT
          ================================================================ */}
          {activeTab === 'seo' && (
            <div className="space-y-6">
              <div className="bg-[#0B1623] border border-white/10 rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-2xl text-white">
                    Search Engine Optimization & Structured Metadata
                  </h2>
                  <p className="text-xs text-white/60 mt-1">
                    XML Sitemap, Robots.txt, Canonical URLs, and OpenGraph tags are automatically generated for every published route.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Link
                    href="/sitemap.xml"
                    target="_blank"
                    className="bg-white/10 hover:bg-white/15 text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5"
                  >
                    <Globe className="w-3.5 h-3.5 text-gold" /> View /sitemap.xml
                  </Link>
                  <Link
                    href="/robots.txt"
                    target="_blank"
                    className="bg-white/10 hover:bg-white/15 text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-gold" /> View /robots.txt
                  </Link>
                </div>
              </div>

              <div className="bg-[#0B1623] border border-white/10 rounded-2xl p-6 space-y-4">
                <h3 className="font-serif text-xl text-gold">
                  Page-Level SEO Metadata Editor
                </h3>
                <div className="space-y-4">
                  {pagesList.map((pg: any) => (
                    <div
                      key={pg._id}
                      className="p-4 rounded-xl bg-navy-950 border border-white/10 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center"
                    >
                      <div className="lg:col-span-3">
                        <div className="font-serif text-lg text-white">{pg.title}</div>
                        <div className="text-[11px] text-gold">/{pg.slug}</div>
                      </div>
                      <div className="lg:col-span-4">
                        <input
                          type="text"
                          defaultValue={pg.seo?.metaTitle || `${pg.title} | Vision Tech Solutions`}
                          placeholder="SEO Meta Title"
                          onBlur={async (e) => {
                            await apiFetch(`/pages/${pg._id}`, {
                              method: 'PUT',
                              body: JSON.stringify({
                                seo: { ...pg.seo, metaTitle: e.target.value },
                              }),
                            });
                            showToast(`Updated SEO title for ${pg.title}`);
                          }}
                          className="w-full bg-[#0B1623] border border-white/15 rounded-lg px-3 py-2 text-xs text-white"
                        />
                      </div>
                      <div className="lg:col-span-5">
                        <input
                          type="text"
                          defaultValue={pg.seo?.metaDescription || pg.description || ''}
                          placeholder="SEO Meta Description"
                          onBlur={async (e) => {
                            await apiFetch(`/pages/${pg._id}`, {
                              method: 'PUT',
                              body: JSON.stringify({
                                seo: { ...pg.seo, metaDescription: e.target.value },
                              }),
                            });
                            showToast(`Updated meta description for ${pg.title}`);
                          }}
                          className="w-full bg-[#0B1623] border border-white/15 rounded-lg px-3 py-2 text-xs text-white"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================================================================
              TAB 10: GLOBAL WEBSITE SETTINGS & MULTILINGUAL ARCHITECTURE
          ================================================================ */}
          {activeTab === 'settings' && settingsForm && (
            <div className="bg-[#0B1623] border border-white/10 rounded-2xl p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h2 className="font-serif text-2xl text-white">
                    Global Company & Website Configuration
                  </h2>
                  <p className="text-xs text-white/55">
                    Update company branding, contact numbers, address, announcement bar, and multilingual readiness.
                  </p>
                </div>
                <button
                  onClick={async () => {
                    await apiFetch('/settings', {
                      method: 'PUT',
                      body: JSON.stringify(settingsForm),
                    });
                    showToast('Global website settings updated across all pages!');
                    invalidateAll();
                  }}
                  className="bg-gold text-navy-950 font-semibold text-xs px-6 py-2.5 rounded-xl"
                >
                  Save Global Settings
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-white/70 mb-1">Company Name</label>
                  <input
                    type="text"
                    value={settingsForm.companyName || ''}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, companyName: e.target.value })
                    }
                    className="w-full bg-navy-950 border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/70 mb-1">Brand Tagline</label>
                  <input
                    type="text"
                    value={settingsForm.tagline || ''}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, tagline: e.target.value })
                    }
                    className="w-full bg-navy-950 border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/70 mb-1">Primary Phone</label>
                  <input
                    type="text"
                    value={settingsForm.phonePrimary || ''}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, phonePrimary: e.target.value })
                    }
                    className="w-full bg-navy-950 border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/70 mb-1">Primary Email</label>
                  <input
                    type="email"
                    value={settingsForm.emailPrimary || ''}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, emailPrimary: e.target.value })
                    }
                    className="w-full bg-navy-950 border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/70 mb-1">WhatsApp Number</label>
                  <input
                    type="text"
                    value={settingsForm.whatsappNumber || ''}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })
                    }
                    className="w-full bg-navy-950 border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/70 mb-1">Business Hours</label>
                  <input
                    type="text"
                    value={settingsForm.businessHours || ''}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, businessHours: e.target.value })
                    }
                    className="w-full bg-navy-950 border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-white/70 mb-1">
                  Headquarters / Studio Address
                </label>
                <input
                  type="text"
                  value={settingsForm.address || ''}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, address: e.target.value })
                  }
                  className="w-full bg-navy-950 border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white"
                />
              </div>

              {/* Announcement Bar Config */}
              <div className="p-4 rounded-xl bg-navy-950 border border-white/10 space-y-3">
                <label className="flex items-center gap-2 text-xs font-semibold text-gold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(settingsForm.announcementBar?.enabled)}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        announcementBar: {
                          ...settingsForm.announcementBar,
                          enabled: e.target.checked,
                        },
                      })
                    }
                  />
                  <span>Enable Top Website Announcement Bar</span>
                </label>
                <input
                  type="text"
                  value={settingsForm.announcementBar?.text || ''}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      announcementBar: {
                        ...settingsForm.announcementBar,
                        text: e.target.value,
                      },
                    })
                  }
                  placeholder="Announcement bar text..."
                  className="w-full bg-[#0B1623] border border-white/15 rounded-lg px-3.5 py-2 text-xs text-white"
                />
              </div>

              {/* Future-Ready Multilingual Architecture Status */}
              <div className="p-4 rounded-xl bg-navy-950 border border-white/10 space-y-2">
                <div className="text-xs font-semibold text-gold">
                  Multilingual Architecture Readiness (English Default + Regional Indian Languages)
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {SUPPORTED_LOCALES.map((loc) => (
                    <span
                      key={loc.code}
                      className={`px-3 py-1.5 rounded-lg text-xs border ${
                        loc.code === 'en'
                          ? 'bg-gold/20 border-gold text-gold font-semibold'
                          : 'bg-white/5 border-white/10 text-white/70'
                      }`}
                    >
                      {loc.name} ({loc.nativeName}) — /{loc.code}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================================================================
              TAB 11: USERS, ROLES & CONFIGURABLE PERMISSIONS (RBAC)
          ================================================================ */}
          {activeTab === 'users' && (
            <div className="space-y-8">
              {/* Create Staff User */}
              <div className="bg-[#0B1623] border border-white/10 rounded-2xl p-6 space-y-4">
                <h2 className="font-serif text-2xl text-white">
                  Add CMS Administrator / Staff Account
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                  <input
                    type="text"
                    placeholder="Full Name *"
                    value={newUserForm.name}
                    onChange={(e) =>
                      setNewUserForm({ ...newUserForm, name: e.target.value })
                    }
                    className="bg-navy-950 border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white"
                  />
                  <input
                    type="email"
                    placeholder="Email Address *"
                    value={newUserForm.email}
                    onChange={(e) =>
                      setNewUserForm({ ...newUserForm, email: e.target.value })
                    }
                    className="bg-navy-950 border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white"
                  />
                  <input
                    type="password"
                    placeholder="Initial Password *"
                    value={newUserForm.password}
                    onChange={(e) =>
                      setNewUserForm({ ...newUserForm, password: e.target.value })
                    }
                    className="bg-navy-950 border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white"
                  />
                  <select
                    value={newUserForm.roleName}
                    onChange={(e) =>
                      setNewUserForm({ ...newUserForm, roleName: e.target.value })
                    }
                    className="bg-navy-950 border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white"
                  >
                    <option value="Super Administrator">Super Administrator</option>
                    <option value="Administrator">Administrator</option>
                    <option value="Content Manager">Content Manager</option>
                    <option value="Gallery Manager">Gallery Manager</option>
                    <option value="Project Manager">Project Manager</option>
                  </select>
                  <button
                    onClick={async () => {
                      try {
                        await apiFetch('/users', {
                          method: 'POST',
                          body: JSON.stringify(newUserForm),
                        });
                        showToast(`Created user ${newUserForm.name} (${newUserForm.roleName})`);
                        setNewUserForm({
                          name: '',
                          email: '',
                          password: '',
                          roleName: 'Content Manager',
                          designation: '',
                        });
                        invalidateAll();
                      } catch (err: any) {
                        showToast(err.message, false);
                      }
                    }}
                    className="bg-gold text-navy-950 font-semibold text-xs px-4 py-2.5 rounded-xl"
                  >
                    + Create User
                  </button>
                </div>
              </div>

              {/* Active Users List */}
              <div className="bg-[#0B1623] border border-white/10 rounded-2xl p-6 space-y-4">
                <h3 className="font-serif text-2xl text-white">
                  Active CMS Users ({usersRbacData?.users?.length || 0})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(usersRbacData?.users || []).map((u: any) => (
                    <div
                      key={u._id}
                      className="p-4 rounded-xl bg-navy-950 border border-white/10 flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="font-semibold text-sm text-white">{u.name}</div>
                        <div className="text-xs text-white/60">{u.email}</div>
                        <span className="inline-block mt-1.5 text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-gold/20 text-gold font-semibold">
                          {u.roleName}
                        </span>
                      </div>
                      <select
                        value={u.roleName}
                        onChange={async (e) => {
                          try {
                            await apiFetch(`/users/${u._id}`, {
                              method: 'PUT',
                              body: JSON.stringify({ roleName: e.target.value }),
                            });
                            showToast(`Updated ${u.name}'s role to ${e.target.value}`);
                            invalidateAll();
                          } catch (err: any) {
                            showToast(err.message, false);
                          }
                        }}
                        className="bg-[#0B1623] border border-white/15 rounded-lg px-2 py-1 text-[11px] text-white"
                      >
                        <option value="Super Administrator">Super Administrator</option>
                        <option value="Administrator">Administrator</option>
                        <option value="Content Manager">Content Manager</option>
                        <option value="Gallery Manager">Gallery Manager</option>
                        <option value="Project Manager">Project Manager</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              {/* Role Permissions Matrix */}
              <div className="bg-[#0B1623] border border-white/10 rounded-2xl p-6 space-y-4">
                <h3 className="font-serif text-2xl text-white">
                  Role-Based Access Control (5 Roles & Configurable Permissions)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {(usersRbacData?.roles || []).map((role: any) => (
                    <div
                      key={role._id}
                      className="p-4 rounded-xl bg-navy-950 border border-white/10 space-y-2.5"
                    >
                      <div className="font-serif text-lg text-gold font-semibold">
                        {role.name}
                      </div>
                      <p className="text-[11px] text-white/60 leading-relaxed">
                        {role.description}
                      </p>
                      <div className="pt-2 border-t border-white/10 flex flex-wrap gap-1">
                        {(role.permissions || []).map((perm: string) => (
                          <span
                            key={perm}
                            className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-white/80"
                          >
                            {perm}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
