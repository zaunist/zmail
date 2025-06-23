import { Env } from './types';
import { initializeDatabase, cleanupExpiredMailboxes, cleanupExpiredMails, cleanupReadMails } from './database';
import { handleEmail } from './email-handler';
import app from './routes';

// 导出Worker处理函数
export default {
  // 处理HTTP请求
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    
    try {
      // 自动初始化数据库（如果需要）
      await initializeDatabase(env.DB);
      
      // 手动初始化数据库（如果请求中包含init参数）
      if (url.searchParams.has('init')) {
        return new Response(JSON.stringify({ 
          success: true, 
          message: '数据库初始化成功' 
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // 处理API请求
      return app.fetch(request, env, ctx);
    } catch (error) {
      console.error('请求处理失败:', error);
      
      // 返回详细的错误信息
      return new Response(JSON.stringify({
        success: false,
        error: '服务器内部错误',
        message: error instanceof Error ? error.message : String(error)
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  },
  
  // 处理邮件
  async email(message: any, env: Env, _ctx: ExecutionContext): Promise<void> {
    try {
      await handleEmail(message, env);
    } catch (error) {
      console.error('处理邮件失败:', error);
      throw new Error(`Failed to process email: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
  
  // 定时任务 - 每小时清理过期邮箱以及过期邮件和已被阅读的邮件
  async scheduled(_event: ScheduledEvent, env: Env, _ctx: ExecutionContext): Promise<void> {
    try {
      const deleted = await cleanupExpiredMailboxes(env.DB);
      console.log(`已清理 ${deleted} 个过期邮箱`);
      const deletedMail = await cleanupExpiredMails(env.DB);
      console.log(`已清理 ${deletedMail} 个过期邮件`);
      const deletedReadMail = await cleanupReadMails(env.DB);
      console.log(`已清理 ${deletedReadMail} 个已被阅读的邮件`);
    } catch (error) {
      console.error('定时任务执行失败:', error);
    }
  },
};