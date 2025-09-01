import { siteConfig } from "@/config/site";

export default function AnnouncementBar() {
  return (
    <div className="bg-primary text-primary-foreground text-sm text-center py-2 px-4">
      <div className="container mx-auto">
        <span className="font-medium">{siteConfig.announcementBar}</span>
      </div>
    </div>
  );
}