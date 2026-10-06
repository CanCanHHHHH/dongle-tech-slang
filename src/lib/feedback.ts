// 反馈渠道:默认走 GitHub Issues(公开仓库,作者能在 Issues 看到全部反馈)。
// 日后改用免登录表单(腾讯问卷 / Tally / Google 表单)时,把 FEEDBACK_FORM 换成表单链接,全站入口自动切换。
export const REPO_URL = 'https://github.com/CanCanHHHHH/dongle-tech-slang';
export const FEEDBACK_FORM = '';

export function feedbackURL(term?: string): string {
  if (FEEDBACK_FORM) return FEEDBACK_FORM;
  const title = term ? `类比反馈:${term}` : '体验反馈 / 建议';
  const body = term
    ? `【词条】${term}\n\n【我觉得可以更好的地方】\n`
    : `【我的体验 / 建议】\n\n【哪里最卡壳,或最有帮助】\n`;
  return `${REPO_URL}/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
}
