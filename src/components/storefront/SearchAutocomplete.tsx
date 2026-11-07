"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X, ArrowRight, Sparkles, Tag } from "lucide-react";
import Image from "next/image";

interface SearchResultItem {
  id: string;
  title: string;
  slug: string;
  brand: string;
  category: string;
  price: number;
  mrp: number;
  image: string;
  rating: number;
  stockAvailable: number;
}

export function SearchAutocomplete() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [brands, setBrands] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [popularSearches, setPopularSearches] = useState<string[]>([
    "iPhone 16 Pro",
    "Galaxy S24 Ultra",
    "OnePlus 12",
    "GaN Charger",
    "AirPods Pro",
  ]);

  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced live fetch
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setCategories([]);
      setBrands([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        const data = await res.json();
        if (data.success) {
          setResults(data.products || []);
          setCategories(data.categories || []);
          setBrands(data.brands || []);
          if (data.popular) setPopularSearches(data.popular);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      router.push(`/shop?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleSelectPopular = (term: string) => {
    setQuery(term);
    setIsOpen(false);
    router.push(`/shop?q=${encodeURIComponent(term)}`);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-xs lg:max-w-sm">
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          placeholder="Search phones, brands, accessories..."
          className="w-full pl-9 pr-8 py-2 rounded-full bg-[#fffaf5] border border-[#493129]/15 text-xs text-[#493129] placeholder-[#493129]/40 focus:outline-none focus:border-[#8b597b] focus:ring-1 focus:ring-[#8b597b] transition shadow-xs"
        />
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#493129]/40 pointer-events-none" />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#493129]/40 hover:text-[#493129]"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </form>

      {/* Dropdown Flyout */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#ffeedb] border border-[#493129]/15 rounded-2xl shadow-xl overflow-hidden z-50 text-[#493129]">
          {/* Popular searches suggestions if empty or typing */}
          {!query.trim() && (
            <div className="p-4">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#8b597b] uppercase tracking-wider mb-2">
                <Sparkles className="w-3 h-3 text-[#efa3a0]" />
                <span>Trending Searches</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {popularSearches.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => handleSelectPopular(term)}
                    className="text-xs px-2.5 py-1 rounded-full bg-[#fffaf5] border border-[#493129]/10 hover:border-[#8b597b] hover:text-[#8b597b] transition"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Active query results */}
          {query.trim() && (
            <div className="max-h-96 overflow-y-auto divide-y divide-[#493129]/10">
              {/* Category & Brand tags */}
              {(categories.length > 0 || brands.length > 0) && (
                <div className="p-3 bg-[#ffdec7]/30 flex flex-wrap gap-1.5 text-xs">
                  {categories.map((c) => (
                    <Link
                      key={c.id}
                      href={`/shop?category=${c.slug}`}
                      onClick={() => setIsOpen(false)}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#fffaf5] border border-[#493129]/10 font-medium hover:border-[#8b597b] transition"
                    >
                      <Tag className="w-2.5 h-2.5 text-[#8b597b]" />
                      Category: {c.name}
                    </Link>
                  ))}
                  {brands.map((b) => (
                    <Link
                      key={b.id}
                      href={`/shop?brand=${b.slug}`}
                      onClick={() => setIsOpen(false)}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#fffaf5] border border-[#493129]/10 font-medium hover:border-[#8b597b] transition"
                    >
                      Brand: {b.name}
                    </Link>
                  ))}
                </div>
              )}

              {/* Product results list */}
              {loading ? (
                <div className="p-6 text-center text-xs text-[#493129]/60">Searching inventory...</div>
              ) : results.length > 0 ? (
                <div className="py-2">
                  <div className="px-4 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#8b597b]">
                    Products Matching &quot;{query}&quot;
                  </div>
                  {results.map((item) => (
                    <Link
                      key={item.id}
                      href={`/product/${item.slug}`}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-[#fffaf5] transition group"
                    >
                      <div className="relative w-10 h-10 rounded-md bg-white border border-[#493129]/10 overflow-hidden flex-shrink-0">
                        <Image src={item.image} alt={item.title} fill className="object-contain p-1" sizes="40px" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-[#493129] group-hover:text-[#8b597b] transition truncate">
                          {item.title}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-[#493129]/70">
                          <span className="font-semibold text-[#493129]">₹{item.price.toLocaleString("en-IN")}</span>
                          {item.mrp > item.price && (
                            <span className="line-through text-[#493129]/40 text-[10px]">
                              ₹{item.mrp.toLocaleString("en-IN")}
                            </span>
                          )}
                          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1 rounded">
                            {item.stockAvailable > 0 ? "In Stock" : "Sold Out"}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-[#493129]/60">
                  No direct products found for &quot;{query}&quot;. Press enter to search all specifications.
                </div>
              )}

              {/* View all results footer link */}
              <div className="p-3 bg-[#fffaf5] text-center">
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8b597b] hover:text-[#493129] transition"
                >
                  <span>See all matching items in The Collection</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

