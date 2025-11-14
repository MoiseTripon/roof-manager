import { ReactNode } from "react";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";

interface LocaleLayoutProps {
  children: ReactNode;
}

export default function LocaleLayout({ children }: LocaleLayoutProps) {
  return (
    <>
      <LocaleSwitcher />
      {children}
    </>
  );
}
