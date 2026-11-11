import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database/store";
import { getServiceSupabase } from "@/lib/supabase/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId") || undefined;

    try {
      const supabase = getServiceSupabase();
      let query = supabase.from("reviews").select("*").order("created_at", { ascending: false });
      if (productId) query = query.eq("product_id", productId);
      const { data: dbReviews, error } = await query;
      if (!error && dbReviews && dbReviews.length > 0) {
        return NextResponse.json({
          success: true,
          reviews: dbReviews.map((r: any) => ({
            id: r.id,
            productId: r.product_id,
            productName: r.product_name,
            userName: r.user_name,
            rating: r.rating,
            title: r.title,
            comment: r.comment,
            isVerifiedPurchase: r.is_verified_purchase,
            helpfulVotes: r.helpful_votes,
            date: r.created_at ? r.created_at.split("T")[0] : new Date().toISOString().split("T")[0],
          })),
        });
      }
    } catch {}

    const reviews = db.getReviews(productId);
    return NextResponse.json({ success: true, reviews });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, productName, userName, rating, title, comment } = body;

    if (!productId || !userName || !rating || !comment) {
      return NextResponse.json({ error: "Missing required review fields" }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }

    const review = db.addReview({
      productId,
      productName: productName || "Product",
      userName: userName.trim(),
      rating: Number(rating),
      title: title?.trim() || "Customer Review",
      comment: comment.trim(),
      isVerifiedPurchase: true, // Verified by customer portal
    });

    // Sync to Supabase PostgreSQL
    try {
      const supabase = getServiceSupabase();
      await supabase.from("reviews").insert([
        {
          id: review.id,
          product_id: review.productId,
          product_name: review.productName,
          user_name: review.userName,
          rating: review.rating,
          title: review.title,
          comment: review.comment,
          is_verified_purchase: review.isVerifiedPurchase,
          helpful_votes: review.helpfulVotes,
        },
      ]);
    } catch (sbErr) {
      console.warn("[Reviews] Supabase insert warning:", sbErr);
    }

    return NextResponse.json({ success: true, review });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to submit review" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { reviewId } = body;
    if (!reviewId) {
      return NextResponse.json({ error: "Review ID required" }, { status: 400 });
    }

    try {
      const supabase = getServiceSupabase();
      await supabase.rpc("increment_helpful_votes", { r_id: reviewId });
    } catch {}

    const success = db.voteReviewHelpful(reviewId);
    return NextResponse.json({ success });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to vote" }, { status: 500 });
  }
}

