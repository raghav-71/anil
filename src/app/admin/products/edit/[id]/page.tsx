"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { Product } from "@/types";

export default function EditProductPage() {
  const params = useParams();
  const id = params.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products?includeUnpublished=true")
      .then((res) => res.json())
      .then((data) => {
        const found = (data.products as Product[]).find((p) => p.id === id || p.slug === id);
        if (found) setProduct(found);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400 font-mono text-xs">
        Loading product information...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-12 text-center space-y-3">
        <h2 className="text-white font-bold text-base">Product Not Found</h2>
        <p className="text-slate-400 text-xs">The requested product ID does not exist in the database.</p>
      </div>
    );
  }

  return <ProductForm initialProduct={product} isEdit={true} />;
}

