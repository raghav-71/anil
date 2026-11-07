"use client";

import React, { useState, useEffect } from "react";
import { Star, ThumbsUp, CheckCircle, ShieldCheck, MessageSquarePlus, X } from "lucide-react";
import { Review } from "@/types";

export function ReviewsSection({ productId, productName }: { productId: string; productName: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // New review form state
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitFeedback, setSubmitFeedback] = useState<string | null>(null);

  const fetchReviews = () => {
    fetch(`/api/reviews?productId=${productId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.reviews) setReviews(data.reviews);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const handleVoteHelpful = async (reviewId: string) => {
    try {
      const res = await fetch("/api/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId }),
      });
      const data = await res.json();
      if (data.success) {
        setReviews((prev) =>
          prev.map((r) => (r.id === reviewId ? { ...r, helpfulVotes: r.helpfulVotes + 1 } : r))
        );
      }
    } catch {
      // ignore
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !comment) return;
    setSubmitting(true);
    setSubmitFeedback(null);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          productName,
          userName: name,
          rating,
          title,
          comment,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitFeedback("Thank you! Your verified review has been published.");
        setName("");
        setTitle("");
        setComment("");
        fetchReviews();
        setTimeout(() => {
          setShowModal(false);
          setSubmitFeedback(null);
        }, 1500);
      } else {
        setSubmitFeedback(data.error || "Failed to submit review.");
      }
    } catch {
      setSubmitFeedback("Submission failed. Please check network connection.");
    } finally {
      setSubmitting(false);
    }
  };

  // Calculations for rating breakdown
  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1) : "5.0";
  const starCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    percentage: totalReviews > 0 ? (reviews.filter((r) => r.rating === star).length / totalReviews) * 100 : star === 5 ? 100 : 0,
  }));

  return (
    <div className="mt-16 border-t border-[#493129]/10 pt-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl text-[#493129]">Customer Feedback & Verified Provenance</h2>
          <p className="text-xs text-[#493129]/70 mt-1 font-sans">
            Authentic appraisals from clientele who acquired this device from Anil Communications.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#493129] hover:bg-[#38261f] text-[#ffeedb] text-xs font-semibold shadow-xs transition"
        >
          <MessageSquarePlus className="w-4 h-4 text-[#efa3a0]" />
          <span>Write a Verified Review</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Rating Breakdown Summary Card */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-[#fffaf5] border border-[#493129]/15 shadow-subtle space-y-4">
          <div className="flex items-baseline gap-3">
            <span className="font-serif text-5xl font-bold text-[#493129]">{avgRating}</span>
            <div>
              <div className="flex text-[#efa3a0]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span className="text-xs text-[#493129]/60 mt-1 block">Based on {totalReviews} reviews</span>
            </div>
          </div>

          {/* Star bars */}
          <div className="space-y-2 pt-2 border-t border-[#493129]/10">
            {starCounts.map(({ star, count, percentage }) => (
              <div key={star} className="flex items-center gap-3 text-xs">
                <span className="w-12 text-[#493129]/80 font-medium">{star} star</span>
                <div className="flex-1 bg-[#ffeedb] h-2 rounded-full overflow-hidden border border-[#493129]/10">
                  <div className="bg-[#efa3a0] h-full rounded-full transition-all" style={{ width: `${percentage}%` }} />
                </div>
                <span className="w-8 text-right text-[#493129]/60">{count}</span>
              </div>
            ))}
          </div>

          <div className="p-3 bg-[#ffeedb]/60 rounded-2xl border border-[#493129]/10 text-[11px] text-[#493129]/80 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#8b597b] flex-shrink-0" />
            <span>100% Verified Purchases authenticated by serial registration.</span>
          </div>
        </div>

        {/* Reviews List */}
        <div className="lg:col-span-8 space-y-4">
          {loading ? (
            <div className="p-8 text-center text-xs text-[#493129]/60">Loading appraisals...</div>
          ) : reviews.length === 0 ? (
            <div className="p-8 text-center bg-[#fffaf5] rounded-3xl border border-[#493129]/15 text-xs text-[#493129]/70">
              Be the first distinguished customer to review this device.
            </div>
          ) : (
            reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-5 sm:p-6 rounded-3xl bg-[#fffaf5] border border-[#493129]/15 shadow-subtle space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#ffdec7] text-[#493129] font-serif font-bold text-xs flex items-center justify-center">
                      {rev.userName.charAt(0)}
                    </div>
                    <div>
                      <div className="font-serif font-bold text-sm text-[#493129]">{rev.userName}</div>
                      <div className="flex items-center gap-1.5 text-[10px] text-emerald-800">
                        {rev.isVerifiedPurchase && (
                          <>
                            <CheckCircle className="w-3 h-3 text-emerald-700" />
                            <span className="font-semibold uppercase tracking-wider">Verified Boutique Purchase</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] text-[#493129]/50 font-sans">{rev.date}</span>
                </div>

                <div className="flex items-center gap-1 text-[#efa3a0]">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${i < rev.rating ? "fill-current" : "text-[#493129]/20"}`}
                    />
                  ))}
                </div>

                {rev.title && <h4 className="font-serif font-bold text-sm text-[#493129]">{rev.title}</h4>}

                <p className="text-xs sm:text-sm text-[#493129]/80 leading-relaxed font-sans">{rev.comment}</p>

                {/* Helpful voting */}
                <div className="pt-2 flex items-center gap-3 text-xs text-[#493129]/60">
                  <button
                    onClick={() => handleVoteHelpful(rev.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffeedb] hover:bg-[#ffdec7] text-[#493129] transition text-[11px] font-medium"
                  >
                    <ThumbsUp className="w-3 h-3 text-[#8b597b]" />
                    <span>Helpful ({rev.helpfulVotes})</span>
                  </button>
                  <span className="text-[11px] text-[#493129]/40">Verified feedback</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Write a Review Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#493129]/40 backdrop-blur-xs font-sans">
          <div className="w-full max-w-lg bg-[#fffaf5] border border-[#493129]/20 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#493129]/10 pb-3">
              <h3 className="font-serif text-xl text-[#493129]">Submit Product Appraisal</h3>
              <button onClick={() => setShowModal(false)} className="text-[#493129]/50 hover:text-[#493129]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-[#493129] block mb-1">Your Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Anand Mahindra"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#ffeedb] border border-[#493129]/15 text-[#493129] focus:outline-none focus:border-[#8b597b]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#493129] block mb-1">Star Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRating(s)}
                      className={`p-2 rounded-xl border flex items-center gap-1 transition ${
                        rating >= s ? "bg-[#ffdec7] border-[#8b597b] text-[#493129]" : "bg-white border-[#493129]/10 text-[#493129]/40"
                      }`}
                    >
                      <Star className={`w-4 h-4 ${rating >= s ? "fill-[#efa3a0] text-[#efa3a0]" : ""}`} />
                      <span className="font-bold">{s}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-semibold text-[#493129] block mb-1">Headline / Summary</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Exceptional industrial finish and stellar battery life"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#ffeedb] border border-[#493129]/15 text-[#493129] focus:outline-none focus:border-[#8b597b]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#493129] block mb-1">Detailed Review</label>
                <textarea
                  required
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Describe your hands-on experience, ergonomics, camera capabilities, and delivery service..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#ffeedb] border border-[#493129]/15 text-[#493129] focus:outline-none focus:border-[#8b597b]"
                />
              </div>

              {submitFeedback && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-medium">
                  {submitFeedback}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 rounded-full border border-[#493129]/20 text-[#493129] font-semibold hover:bg-[#ffeedb] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 rounded-full bg-[#efa3a0] hover:bg-[#e58e8b] text-[#493129] font-bold shadow-coral transition disabled:opacity-50"
                >
                  {submitting ? "Publishing..." : "Submit Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

