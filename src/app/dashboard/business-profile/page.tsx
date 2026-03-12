'use client'

import { useState, useEffect } from 'react'
import {
  ExternalLinkIcon,
  CopyIcon,
  EditIcon,
  CheckIcon,
  XIcon,
  InstagramIcon,
  MessageCircleIcon,
  SaveIcon,
} from 'lucide-react'
import toast from 'react-hot-toast'

interface UserProfile {
  id: string
  email: string
  name: string
  username: string
  phone: string | null
  businessName: string
  whatsapp: string | null
  instagramHandle: string | null
  tiktokHandle: string | null
}

const formatPrice = (price: number): string =>
  price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')

export default function BusinessProfileDashboard() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState<Partial<UserProfile>>({})
  const [showLinkShare, setShowLinkShare] = useState(false)

  useEffect(() => {
    fetch('/api/user/profile')
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setProfile(data.user)
          setFormData(data.user)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const copyProfileLink = () => {
    if (!profile) return
    navigator.clipboard.writeText(`${window.location.origin}/business/${profile.username}`)
    toast.success('Profile link copied!')
  }

  const handleSave = async () => {
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: formData.businessName,
          phone: formData.phone,
          whatsapp: formData.whatsapp,
          instagramHandle: formData.instagramHandle,
          tiktokHandle: formData.tiktokHandle,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setProfile(data.user)
      setFormData(data.user)
      setEditing(false)
      toast.success('Profile updated')
    } catch {
      toast.error('Failed to save profile')
    }
  }

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">Loading profile\u2026</div>
    )
  }

  if (!profile) {
    return (
      <div className="p-6 text-center text-gray-500">Could not load profile.</div>
    )
  }

  const storeUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/business/${profile.username}`

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Your Business Profile</h1>
          <p className="text-gray-600">Manage your public business page</p>
        </div>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <EditIcon className="h-4 w-4 mr-2" />
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={() => { setEditing(false); setFormData(profile) }}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <XIcon className="h-4 w-4 mr-2" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <SaveIcon className="h-4 w-4 mr-2" />
              Save
            </button>
          </div>
        )}
      </div>

      {/* Business Profile Card */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="flex-1 space-y-4">
            {editing ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                  <input
                    type="text"
                    value={formData.businessName ?? ''}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone ?? ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      placeholder="+27 82 123 4567"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                    <input
                      type="text"
                      value={formData.whatsapp ?? ''}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      placeholder="27821234567"
                    />
                  </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Instagram handle</label>
                    <input
                      type="text"
                      value={formData.instagramHandle ?? ''}
                      onChange={(e) => setFormData({ ...formData, instagramHandle: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      placeholder="@yourhandle"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">TikTok handle</label>
                    <input
                      type="text"
                      value={formData.tiktokHandle ?? ''}
                      onChange={(e) => setFormData({ ...formData, tiktokHandle: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      placeholder="@yourhandle"
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-xl font-semibold text-gray-900">{profile.businessName}</h2>
                <div className="text-sm text-gray-600 space-y-1">
                  <p className="flex items-center gap-2">
                    <span className="text-gray-400">Store URL:</span>
                    <code className="text-blue-600 text-xs">/business/{profile.username}</code>
                  </p>
                  {profile.phone && <p><span className="text-gray-400">Phone:</span> {profile.phone}</p>}
                  {profile.whatsapp && <p><span className="text-gray-400">WhatsApp:</span> {profile.whatsapp}</p>}
                </div>
                <div className="flex items-center gap-4">
                  {profile.instagramHandle && (
                    <a
                      href={`https://instagram.com/${profile.instagramHandle.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-pink-600 hover:text-pink-700 text-sm"
                    >
                      <InstagramIcon className="h-4 w-4 mr-1" />
                      {profile.instagramHandle}
                    </a>
                  )}
                  {profile.tiktokHandle && (
                    <a
                      href={`https://tiktok.com/${profile.tiktokHandle.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-gray-800 hover:text-gray-900 text-sm"
                    >
                      <MessageCircleIcon className="h-4 w-4 mr-1" />
                      {profile.tiktokHandle}
                    </a>
                  )}
                </div>
              </>
            )}
          </div>

          {!editing && (
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowLinkShare(true)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <ExternalLinkIcon className="h-4 w-4 mr-2" />
                Share Link
              </button>
              <a
                href={`/business/${profile.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <ExternalLinkIcon className="h-4 w-4 mr-2" />
                View Public Page
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Share Link Modal */}
      {showLinkShare && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-md shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Share Your Business Profile</h3>
            <div className="bg-gray-50 p-4 rounded-md mb-4">
              <p className="text-sm text-gray-700 mb-2">Copy this link to share on social media:</p>
              <div className="flex items-center space-x-2">
                <code className="flex-1 text-sm bg-white p-2 rounded border text-blue-600 break-all">
                  {storeUrl}
                </code>
                <button onClick={copyProfileLink} className="p-2 text-gray-500 hover:text-gray-700">
                  <CopyIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-md mb-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Example Social Media Post:</h4>
              <div className="text-sm text-blue-800 italic">
                &quot;\uD83D\uDD25 New products just dropped! Check out my collection and order directly: <br />
                \uD83D\uDC49 {storeUrl} <br />
                #ShopOnline #SouthAfrica #BuyLocal&quot;
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowLinkShare(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
