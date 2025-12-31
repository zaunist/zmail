import React from "react";
import { useTranslation } from "react-i18next";
import Container from "./Container";

// 定义 props 类型，允许父组件传递控制弹窗显示的函数
interface FooterProps {
  onShowInfo: (infoType: "privacy" | "terms" | "about") => void;
}

const Footer: React.FC<FooterProps> = ({ onShowInfo }) => {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t py-6">
      <Container>
        <div className="text-center text-sm text-muted-foreground">
          <p className="mb-2">
            © {year} {t("app.title")}
          </p>
          <div className="flex flex-wrap justify-center items-center space-x-4 mb-2">
            {/* 将 Link 组件修改为 button，点击时调用 onShowInfo 函数显示弹窗 */}
            <button
              onClick={() => onShowInfo("privacy")}
              className="hover:text-primary transition-colors"
            >
              {t("common.privacyPolicy", "隐私政策")}
            </button>
            <button
              onClick={() => onShowInfo("terms")}
              className="hover:text-primary transition-colors"
            >
              {t("common.terms", "使用条款")}
            </button>
            <button
              onClick={() => onShowInfo("about")}
              className="hover:text-primary transition-colors"
            >
              {t("common.about", "关于我们")}
            </button>
          </div>
          <div className="flex justify-center items-center space-x-4">
            <a
              href="https://ajielu.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              <i className="fas fa-blog mr-1"></i>
              {t("common.blog")}
            </a>
            <a
              href="https://www.youtube.com/@zaunist"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              <i className="fab fa-youtube mr-1"></i>
              {t("common.youtube")}
            </a>
            <a
              href="https://xugou.mdzz.uk"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              <i className="fas fa-chart-line mr-1"></i>
              {t("common.xugouMonitor")}
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
