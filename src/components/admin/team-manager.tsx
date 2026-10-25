'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Users,
  PlusCircle,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  ExternalLink,
  Check,
  AlertCircle,
  X,
  Loader2,
} from 'lucide-react';
import { TeamMemberRecord } from '@/lib/db/types';

function LinkedinIcon({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
  );
}

function GithubIcon({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

interface TeamManagerProps {
  initialMembers: TeamMemberRecord[];
}

interface MemberFormData {
  id?: string;
  name: string;
  role: string;
  department: string;
  session: string;
  badge: string;
  bio: string;
  avatarUrl: string;
  cardUrl: string;
  linkedin_url: string;
  github_url: string;
}

const defaultFormData: MemberFormData = {
  name: '',
  role: '',
  department: 'Computer Science & Engineering',
  session: '2026-27',
  badge: 'Leadership Core',
  bio: '',
  avatarUrl: '/sbg-logo.svg',
  cardUrl: '',
  linkedin_url: '',
  github_url: '',
};

export function TeamManager({ initialMembers }: TeamManagerProps) {
  const router = useRouter();
  const [members, setMembers] = useState<TeamMemberRecord[]>(initialMembers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<MemberFormData>(defaultFormData);
  const [deleteConfirmMember, setDeleteConfirmMember] = useState<TeamMemberRecord | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Status feedback
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback((prev) => (prev?.message === message ? null : prev));
    }, 4500);
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData(defaultFormData);
    setIsModalOpen(true);
  };

  const openEditModal = (member: TeamMemberRecord) => {
    setEditingId(member.id);
    setFormData({
      id: member.id,
      name: member.name,
      role: member.role,
      department: member.department || 'Computer Science & Engineering',
      session: member.session || '2026-27',
      badge: member.badge || 'Leadership Core',
      bio: member.bio || '',
      avatarUrl: member.avatarUrl || '/sbg-logo.svg',
      cardUrl: member.cardUrl || member.avatarUrl || '',
      linkedin_url: member.linkedin_url || '',
      github_url: member.github_url || '',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit Add or Edit
  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      showFeedback('error', 'Please enter the member full name');
      return;
    }

    if (!formData.role.trim()) {
      showFeedback('error', 'Please enter the role title (e.g. Co-Lead, Web Lead, Cloud Lead)');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(editingId ? { id: editingId } : {}),
          ...formData,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save team member');
      }

      setMembers(data.members);
      showFeedback('success', data.message || 'Member saved successfully!');
      closeModal();
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      showFeedback('error', message);
    } finally {
      setLoading(false);
    }
  };

  // Delete Member
  const handleDeleteMember = async () => {
    if (!deleteConfirmMember) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/admin/team?id=${encodeURIComponent(deleteConfirmMember.id)}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete team member');
      }

      setMembers(data.members);
      showFeedback('success', `${deleteConfirmMember.name} has been removed from Core Team.`);
      setDeleteConfirmMember(null);
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete';
      showFeedback('error', message);
    } finally {
      setLoading(false);
    }
  };

  // Move member position Up or Down
  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= members.length) return;

    const newMembers = [...members];
    const [moved] = newMembers.splice(index, 1);
    newMembers.splice(targetIndex, 0, moved);

    // Optimistic UI update
    setMembers(newMembers);

    try {
      const res = await fetch('/api/admin/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reorder',
          ids: newMembers.map((m) => m.id),
        }),
      });

      const data = await res.json();
      if (res.ok && data.members) {
        setMembers(data.members);
        router.refresh();
      }
    } catch {
      // Revert if error
      setMembers(members);
      showFeedback('error', 'Failed to save new team order');
    }
  };

  // Reset to original appointed team
  const handleResetToDefaults = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset' }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset');
      }

      setMembers(data.members);
      showFeedback('success', 'Core team reset to initial appointed leads!');
      setIsResetConfirmOpen(false);
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to reset';
      showFeedback('error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-xs font-medium animate-in fade-in slide-in-from-top-2 duration-200 ${
            feedback.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300'
              : 'bg-red-950/60 border-red-500/30 text-red-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="p-1 hover:opacity-75 transition"
            aria-label="Dismiss message"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Action Header Card */}
      <div className="p-5 sm:p-6 rounded-xl bg-[#111111] border border-[#262626] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base sm:text-lg font-bold text-white font-heading">
              Current Core Team ({members.length} Members)
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FF9900]/15 text-[#FF9900] border border-[#FF9900]/30">
              Live on Homepage
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Add new appointed organizers, update roles and bios, change photo avatars, or reorder members.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href="/#team"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#181818] hover:bg-[#222222] border border-[#333333] text-gray-200 hover:text-white text-xs font-semibold rounded-lg transition"
          >
            <span>View Live Section</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            type="button"
            onClick={() => setIsResetConfirmOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#181818] hover:bg-[#251e1e] border border-[#333333] text-gray-400 hover:text-amber-400 text-xs font-semibold rounded-lg transition"
            title="Reset to default appointed leads"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF9900] hover:bg-[#FFAA22] text-black text-xs font-bold uppercase tracking-wider rounded-lg transition shadow-md shadow-[#FF9900]/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Member</span>
          </button>
        </div>
      </div>

      {/* Members Grid / List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {members.map((member, index) => (
          <div
            key={member.id}
            className="bg-[#121212] border border-[#262626] hover:border-[#383838] rounded-xl p-5 flex flex-col justify-between transition-all group relative"
          >
            {/* Top row: Order badge & Reorder controls */}
            <div className="flex items-center justify-between pb-3 border-b border-[#1E1E1E]">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-[#1F1F1F] text-gray-300 font-bold text-xs flex items-center justify-center border border-[#2D2D2D]">
                  #{index + 1}
                </span>
                <span className="text-[11px] font-semibold text-[#FF9900] uppercase tracking-wider truncate max-w-[140px]">
                  {member.session || '2026-27'}
                </span>
              </div>

              {/* Move Order Buttons */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleMoveOrder(index, 'up')}
                  disabled={index === 0}
                  className="p-1 rounded text-gray-400 hover:text-white hover:bg-[#222] disabled:opacity-30 disabled:pointer-events-none transition"
                  title="Move Up"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleMoveOrder(index, 'down')}
                  disabled={index === members.length - 1}
                  className="p-1 rounded text-gray-400 hover:text-white hover:bg-[#222] disabled:opacity-30 disabled:pointer-events-none transition"
                  title="Move Down"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Member Profile Body */}
            <div className="py-4 flex items-start gap-4">
              <div className="relative w-16 h-20 rounded-lg overflow-hidden bg-[#181818] border border-[#2B2B2B] shrink-0">
                <Image
                  src={member.avatarUrl || '/sbg-logo.svg'}
                  alt={member.name}
                  fill
                  sizes="64px"
                  className="object-cover object-top"
                  unoptimized
                />
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-bold text-[#FF9900] uppercase tracking-wide">
                    {member.role}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white font-heading truncate">
                  {member.name}
                </h3>
                <p className="text-[11px] text-gray-400 truncate">
                  {member.department}
                </p>
                {member.badge && (
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-[#1F1F1F] text-gray-300 border border-[#2C2C2C]">
                    {member.badge}
                  </span>
                )}
              </div>
            </div>

            {/* Bio Snippet */}
            <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed pb-3 border-b border-[#1E1E1E]">
              {member.bio || 'No bio specified.'}
            </p>

            {/* Action Bar */}
            <div className="pt-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {member.linkedin_url && (
                  <a
                    href={member.linkedin_url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 text-gray-400 hover:text-[#0A66C2] rounded hover:bg-[#1A1A1A] transition"
                    title="LinkedIn"
                  >
                    <LinkedinIcon className="w-3.5 h-3.5" />
                  </a>
                )}
                {member.github_url && (
                  <a
                    href={member.github_url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-[#1A1A1A] transition"
                    title="GitHub"
                  >
                    <GithubIcon className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openEditModal(member)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#1C1C1C] hover:bg-[#282828] text-gray-200 hover:text-white text-xs font-medium border border-[#333333] transition"
                >
                  <Pencil className="w-3 h-3 text-[#FF9900]" />
                  <span>Edit</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDeleteConfirmMember(member)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-[#251818] transition"
                  title="Delete Member"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
          onClick={closeModal}
        >
          <div
            className="relative max-w-2xl w-full bg-[#111111] border border-[#2B2B2B] rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-[#222222] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-[#FF9900]/10 text-[#FF9900] border border-[#FF9900]/30">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white font-heading">
                    {editingId ? 'Edit Core Team Member' : 'Add New Core Team Member'}
                  </h2>
                  <p className="text-xs text-gray-400">
                    {editingId
                      ? 'Modify member details, title, or avatar.'
                      : 'Fill in details to display the new student lead on the live site.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-[#222] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveMember} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300">
                    Full Name <span className="text-[#FF9900]">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    required
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-3 py-2 bg-[#161616] border border-[#2C2C2C] focus:border-[#FF9900] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none transition"
                  />
                </div>

                {/* Role Title */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300">
                    Role Title <span className="text-[#FF9900]">*</span>
                  </label>
                  <input
                    type="text"
                    name="role"
                    value={formData.role}
                    onChange={handleFormChange}
                    required
                    placeholder="e.g. Cloud Security Lead, Web Lead"
                    className="w-full px-3 py-2 bg-[#161616] border border-[#2C2C2C] focus:border-[#FF9900] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Department */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300">Department</label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleFormChange}
                    placeholder="Computer Science & Engineering"
                    className="w-full px-3 py-2 bg-[#161616] border border-[#2C2C2C] focus:border-[#FF9900] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none transition"
                  />
                </div>

                {/* Session */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300">Session</label>
                  <input
                    type="text"
                    name="session"
                    value={formData.session}
                    onChange={handleFormChange}
                    placeholder="2026-27"
                    className="w-full px-3 py-2 bg-[#161616] border border-[#2C2C2C] focus:border-[#FF9900] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none transition"
                  />
                </div>

                {/* Badge Tag */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300">Badge / Category</label>
                  <input
                    type="text"
                    name="badge"
                    value={formData.badge}
                    onChange={handleFormChange}
                    placeholder="Leadership Core, Technical Lab"
                    className="w-full px-3 py-2 bg-[#161616] border border-[#2C2C2C] focus:border-[#FF9900] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none transition"
                  />
                </div>
              </div>

              {/* Avatar URL & Live Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-start">
                <div className="sm:col-span-3 space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300">
                    Avatar Photo URL
                  </label>
                  <input
                    type="text"
                    name="avatarUrl"
                    value={formData.avatarUrl}
                    onChange={handleFormChange}
                    placeholder="/team/rahul-sharma.jpg or https://..."
                    className="w-full px-3 py-2 bg-[#161616] border border-[#2C2C2C] focus:border-[#FF9900] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none transition"
                  />
                  <p className="text-[11px] text-gray-500">
                    You can use local public path (e.g. <code className="text-[#FF9900]">/team/yourname.jpg</code>) or an external image link. Default is <code className="text-[#FF9900]">/sbg-logo.svg</code>.
                  </p>
                </div>

                {/* Photo Preview */}
                <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-[#161616] border border-[#2A2A2A]">
                  <span className="text-[10px] text-gray-400 mb-1">Preview</span>
                  <div className="relative w-14 h-16 rounded overflow-hidden bg-black border border-[#333]">
                    <Image
                      src={formData.avatarUrl || '/sbg-logo.svg'}
                      alt="Preview"
                      fill
                      sizes="56px"
                      className="object-cover object-top"
                      unoptimized
                    />
                  </div>
                </div>
              </div>

              {/* Poster Card URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-300">
                  Appointment Card / Poster URL (Optional)
                </label>
                <input
                  type="text"
                  name="cardUrl"
                  value={formData.cardUrl}
                  onChange={handleFormChange}
                  placeholder="Defaults to Avatar Photo URL if left blank"
                  className="w-full px-3 py-2 bg-[#161616] border border-[#2C2C2C] focus:border-[#FF9900] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none transition"
                />
              </div>

              {/* Bio */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-300">Bio &amp; Responsibilities</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleFormChange}
                  rows={3}
                  placeholder="Describe member responsibilities, chapter focus, or background..."
                  className="w-full px-3 py-2 bg-[#161616] border border-[#2C2C2C] focus:border-[#FF9900] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none transition"
                />
              </div>

              {/* Social Links */}
              <div className="space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                      <LinkedinIcon className="w-3.5 h-3.5 text-[#0A66C2]" />
                      <span>LinkedIn Profile URL</span>
                    </label>
                    <input
                      type="url"
                      name="linkedin_url"
                      value={formData.linkedin_url}
                      onChange={handleFormChange}
                      placeholder="https://linkedin.com/in/username"
                      className="w-full px-3 py-2 bg-[#161616] border border-[#2C2C2C] focus:border-[#FF9900] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                      <GithubIcon className="w-3.5 h-3.5 text-gray-300" />
                      <span>GitHub Profile URL</span>
                    </label>
                    <input
                      type="url"
                      name="github_url"
                      value={formData.github_url}
                      onChange={handleFormChange}
                      placeholder="https://github.com/username"
                      className="w-full px-3 py-2 bg-[#161616] border border-[#2C2C2C] focus:border-[#FF9900] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none transition"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-gray-400">
                  Yeh links website ke team canvas cards aur appointment poster modal me clickable buttons ke roop me dikhayi dengi.
                </p>
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-[#222222] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-lg bg-[#1A1A1A] hover:bg-[#252525] text-gray-300 text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-[#FF9900] hover:bg-[#FFAA22] text-black text-xs font-bold uppercase tracking-wider transition disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>{editingId ? 'Update Member' : 'Add to Core Team'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmMember && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setDeleteConfirmMember(null)}
        >
          <div
            className="relative max-w-md w-full bg-[#111111] border border-red-900/40 rounded-2xl p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-red-950/80 text-red-400 border border-red-500/30">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-heading">
                  Remove Core Team Member?
                </h3>
                <p className="text-xs text-gray-400">
                  This will remove them from the website immediately.
                </p>
              </div>
            </div>

            <div className="p-3 bg-[#161616] rounded-lg border border-[#262626] text-xs space-y-1">
              <p className="font-semibold text-white">{deleteConfirmMember.name}</p>
              <p className="text-[#FF9900]">{deleteConfirmMember.role}</p>
              <p className="text-gray-400">{deleteConfirmMember.department}</p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmMember(null)}
                className="px-4 py-2 rounded-lg bg-[#1A1A1A] hover:bg-[#252525] text-gray-300 text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteMember}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-wider transition disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>Remove Member</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {isResetConfirmOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsResetConfirmOpen(false)}
        >
          <div
            className="relative max-w-md w-full bg-[#111111] border border-amber-900/40 rounded-2xl p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-950/80 text-amber-400 border border-amber-500/30">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-heading">
                  Reset Core Team to Appointed Leads?
                </h3>
                <p className="text-xs text-gray-400">
                  This restores the 6 original student organizers (Samir, Vivek, Anurag, Shivam, Aalok, Kanika).
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-4 py-2 rounded-lg bg-[#1A1A1A] hover:bg-[#252525] text-gray-300 text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetToDefaults}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-black text-xs font-bold uppercase tracking-wider transition disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>Confirm Reset</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
