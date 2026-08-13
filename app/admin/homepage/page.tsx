import { getHomepageSections } from "@/actions/homepage.actions";
import { HomepageManager } from "@/components/admin/homepage-manager";
import { Image as ImageIcon } from "lucide-react";

export default async function AdminHomepagePage() {
  const result = await getHomepageSections();
  const sections = result.sections || [];

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50">
          <ImageIcon className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Homepage Banners</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Manage your storefront hero banners and promotional sections
          </p>
        </div>
      </div>

      <HomepageManager initialSections={sections} />
    </div>
  );
}
