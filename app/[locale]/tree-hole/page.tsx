import { Container } from "@/components/ui/Container";
import ChatInterface from "@/components/ui/ChatInterface";
import { useTranslations } from "next-intl";

export default function TreeHolePage() {
  const t = useTranslations("TreeHole");
  
  return (
    <Container>
      <div className="py-8">
        <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
        <p className="text-muted-foreground mb-6">{t("description")}</p>
        
        <ChatInterface />
        
        <div className="mt-4 text-xs text-muted-foreground">
          <p>{t("disclaimer")}</p>
        </div>
      </div>
    </Container>
  );
}