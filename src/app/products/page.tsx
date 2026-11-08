import { redirect } from "next/navigation";

export default function ProductsRedirect({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const query = new URLSearchParams();
  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      if (typeof value === "string") {
        query.set(key, value);
      }
    });
  }
  const queryString = query.toString();
  redirect(queryString ? `/shop?${queryString}` : "/shop");
}
