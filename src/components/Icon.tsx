import { ICONS } from '../data/icons';

/** 把内联 SVG(随主题变色)渲染成一个定尺寸的图标块 */
export function Icon({ name }: { name: string }) {
  return <span className="ico" dangerouslySetInnerHTML={{ __html: ICONS[name] || '' }} />;
}
