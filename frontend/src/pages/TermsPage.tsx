import React from 'react';
import Container from '../components/Container';

const TermsPage: React.FC = () => {
  return (
    <Container>
      <div className="prose max-w-none mx-auto">
        <h1 className="text-3xl font-bold mb-4 text-center">使用条款</h1>
        <p className="text-lg text-center mb-8 text-muted-foreground">请在使用本临时邮箱服务前仔细阅读以下条款，使用即视为同意本协议。</p>
        <h2 className="text-xl font-semibold mt-8 mb-2">1. 服务说明</h2>
        <ul>
          <li>本服务为用户提供临时、匿名的电子邮箱地址，用于接收邮件、验证码等信息。</li>
          <li>所有邮箱及邮件内容均为临时存储，过期后自动删除，无法恢复。</li>
        </ul>
        <h2 className="text-xl font-semibold mt-8 mb-2">2. 用户责任</h2>
        <ul>
          <li>用户应遵守相关法律法规，不得利用本服务从事任何违法、违规或有害的活动。</li>
          <li>用户应自行承担使用本服务过程中产生的全部风险和责任。</li>
        </ul>
        <h2 className="text-xl font-semibold mt-8 mb-2">3. 禁止行为</h2>
        <ul>
          <li>不得用于发送、接收垃圾邮件、恶意软件、钓鱼信息等非法内容。</li>
          <li>不得用于骚扰、欺诈、侵犯他人隐私或知识产权等行为。</li>
          <li>不得尝试攻击、干扰或破坏本服务的正常运行。</li>
        </ul>
        <h2 className="text-xl font-semibold mt-8 mb-2">4. 免责声明</h2>
        <ul>
          <li>本服务为免费开源项目，按"现状"提供，不对服务的可用性、稳定性或数据完整性作任何承诺。</li>
          <li>因使用本服务导致的任何直接或间接损失，开发者不承担任何责任。</li>
        </ul>
        <h2 className="text-xl font-semibold mt-8 mb-2">5. 服务变更与终止</h2>
        <ul>
          <li>我们有权随时对服务内容进行调整、暂停或终止，无需事先通知用户。</li>
          <li>如发现用户存在违规行为，有权限制或终止其使用本服务。</li>
        </ul>
        <h2 className="text-xl font-semibold mt-8 mb-2">6. 法律适用</h2>
        <ul>
          <li>本使用条款的解释与适用均受开源项目托管地相关法律法规管辖。</li>
        </ul>
        <h2 className="text-xl font-semibold mt-8 mb-2">7. 条款变更</h2>
        <ul>
          <li>我们有权根据需要随时修改本使用条款，变更内容将在页面显著位置公告。</li>
        </ul>
        <p className="text-center mt-10">感谢您使用zmail临时邮箱服务！</p>
      </div>
    </Container>
  );
};

export default TermsPage; 