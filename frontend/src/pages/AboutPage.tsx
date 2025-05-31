import React from "react";
import Container from "../components/Container";

const AboutPage: React.FC = () => {
  return (
    <Container>
      <div className="prose max-w-none mx-auto">
        <h1 className="text-3xl font-bold mb-4 text-center">关于我们</h1>
        <p className="text-lg text-center mb-8 text-muted-foreground">
          ZMAIL - 24小时匿名邮箱，开源、免费、极简、安全
        </p>
        <h2 className="text-xl font-semibold mt-8 mb-2">项目简介</h2>
        <p>
          本项目致力于为用户提供一个无需注册、即开即用的临时邮箱服务，帮助用户在注册网站、接收验证码、保护隐私等场景下，免受垃圾邮件和隐私泄露困扰。
        </p>
        <h2 className="text-xl font-semibold mt-8 mb-2">我们的理念</h2>
        <ul>
          <li>极简体验：无需注册，打开即用，界面简洁友好。</li>
          <li>隐私优先：不收集用户个人信息，邮件自动过期删除。</li>
          <li>开源透明：所有代码开源，欢迎社区参与和监督。</li>
        </ul>
        <h2 className="text-xl font-semibold mt-8 mb-2">开源与贡献</h2>
        <p>
          本项目完全开源，代码托管于{" "}
          <a
            href="https://github.com/zaunist/zmail"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline"
          >
            GitHub
          </a>
          ，欢迎任何人提出建议、反馈或贡献代码。
        </p>
        <h2 className="text-xl font-semibold mt-8 mb-2">联系我们</h2>
        <p>
          如有任何问题或合作意向，可通过{" "}
          <a
            href="https://github.com/zaunist/zmail/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline"
          >
            GitHub Issues
          </a>{" "}
          留言，或在开源社区与我们交流。
        </p>
        <div className="text-center mt-10">
          <span className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-full text-base font-medium shadow">
            感谢您的关注与支持！
          </span>
        </div>
      </div>
    </Container>
  );
};

export default AboutPage;
