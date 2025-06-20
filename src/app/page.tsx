import ItemCheckPageClient from '@/components/itemcheck/item-check-page-client';
import { SidebarInset } from '@/components/ui/sidebar';

export default function Home() {
  return (
    <SidebarInset>
      <div className="p-4 md:p-6 lg:p-8">
        <ItemCheckPageClient />
      </div>
    </SidebarInset>
  );
}
