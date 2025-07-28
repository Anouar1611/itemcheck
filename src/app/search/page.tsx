import { SearchPageClient } from '@/components/search/search-page-client';
import { SidebarInset } from '@/components/ui/sidebar';

export default function SearchPage() {
  return (
    <SidebarInset>
      <div className="p-4 md:p-6 lg:p-8">
        <SearchPageClient />
      </div>
    </SidebarInset>
  );
}
