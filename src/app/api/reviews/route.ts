import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database/store";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId") || undefined;
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
    const success = db.voteReviewHelpful(reviewId);
    return NextResponse.json({ success });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to vote" }, { status: 500 });
  }
}

