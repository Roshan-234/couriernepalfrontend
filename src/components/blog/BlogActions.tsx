"use client";
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
export default function BlogActions({ slug }: { slug: string }) { const { user } = useAuth(); return user?.is_admin ? <Link className="action action-outline" href={`/blog/${slug}/edit`}>Edit article</Link> : null; }
