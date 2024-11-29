'use client';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo 和简介 */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg font-medium bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                文灵AI
              </span>
            </div>
            <p className="text-gray-500 text-sm">
              基于AI技术的小红书图文创作助手，让创作更轻松，让文案更出彩。
            </p>
          </div>

          {/* 快速链接 */}
          <div>
            <h3 className="font-medium text-gray-900 mb-4">快速链接</h3>
            <ul className="space-y-2">
              <li>
                <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-gray-500 hover:text-gray-600 text-sm">
                  功能介绍
                </button>
              </li>
              <li>
                <button onClick={() => document.getElementById('guide')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-gray-500 hover:text-gray-600 text-sm">
                  使用说明
                </button>
              </li>
              <li>
                <button onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-gray-500 hover:text-gray-600 text-sm">
                  价格方案
                </button>
              </li>
            </ul>
          </div>

          {/* 联系方式 */}
          <div>
            <h3 className="font-medium text-gray-900 mb-4">联系我们</h3>
            <ul className="space-y-2">
              <li className="text-gray-500 text-sm">
                <a href="mailto:support@xhscard.top" className="hover:text-gray-600">
                  support@xhscard.top
                </a>
              </li>
              <li className="text-gray-500 text-sm">
                <a href="https://www.xhscard.top" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600">
                  www.xhscard.top
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* 版权信息 */}
        <div className="border-t border-gray-100 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              © {currentYear} 文灵AI. 保留所有权利.
            </p>
            {/* <div className="flex items-center gap-6">
              <a href="/privacy" className="text-gray-500 hover:text-gray-600 text-sm">
                隐私政策
              </a>
              <a href="/terms" className="text-gray-500 hover:text-gray-600 text-sm">
                服务条款
              </a>
            </div> */}
          </div>
        </div>
      </div>
    </footer>
  );
}