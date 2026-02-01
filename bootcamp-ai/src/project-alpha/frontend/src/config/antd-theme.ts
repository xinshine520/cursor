import type { ThemeConfig } from 'antd';

/**
 * Ant Design Theme Configuration
 * Apple-inspired design system
 */
export const antdTheme: ThemeConfig = {
  token: {
    // Colors - Apple-inspired palette
    colorPrimary: '#0071e3', // Apple Blue
    colorSuccess: '#34c759',
    colorWarning: '#ff9500',
    colorError: '#ff3b30',
    colorInfo: '#0071e3',
    
    // Neutral colors
    colorText: '#1d1d1f',
    colorTextSecondary: '#86868b',
    colorTextTertiary: '#6e6e73',
    colorTextQuaternary: '#d2d2d7',
    
    // Background colors
    colorBgContainer: '#ffffff',
    colorBgElevated: '#ffffff',
    colorBgLayout: '#f5f5f7',
    colorBgSpotlight: '#ffffff',
    colorBgMask: 'rgba(0, 0, 0, 0.4)',
    
    // Border colors
    colorBorder: '#e8e8ed',
    colorBorderSecondary: '#d2d2d7',
    
    // Font
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
    fontFamilyCode: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
    fontSize: 14,
    fontSizeLG: 16,
    fontSizeSM: 12,
    fontSizeXL: 20,
    
    // Border radius - Apple uses rounded corners
    borderRadius: 12,
    borderRadiusLG: 18,
    borderRadiusSM: 8,
    borderRadiusXS: 6,
    
    // Spacing - Apple uses generous spacing
    padding: 16,
    paddingLG: 24,
    paddingSM: 12,
    paddingXS: 8,
    paddingXXS: 4,
    
    // Line height
    lineHeight: 1.47059,
    lineHeightLG: 1.47059,
    lineHeightSM: 1.47059,
    
    // Shadows - Apple uses subtle shadows
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    boxShadowSecondary: '0 4px 16px rgba(0, 0, 0, 0.12)',
    
    // Motion
    motionDurationFast: '150ms',
    motionDurationMid: '300ms',
    motionDurationSlow: '500ms',
    motionEaseInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    motionEaseOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    motionEaseIn: 'cubic-bezier(0.4, 0, 0.2, 1)',
    
    // Control height
    controlHeight: 44, // Apple uses taller controls
    controlHeightLG: 52,
    controlHeightSM: 36,
    
    // Z-index
    zIndexBase: 0,
    zIndexPopupBase: 1000,
  },
  components: {
    // Button - Apple style
    Button: {
      borderRadius: 9999, // Full rounded
      fontWeight: 400,
      controlHeight: 44,
      controlHeightLG: 52,
      controlHeightSM: 36,
      paddingInline: 24,
      paddingInlineLG: 32,
      paddingInlineSM: 16,
      primaryShadow: 'none',
      defaultShadow: 'none',
      dangerShadow: 'none',
      boxShadow: 'none',
      boxShadowSecondary: 'none',
    },
    
    // Input - Apple style
    Input: {
      borderRadius: 12,
      controlHeight: 44,
      controlHeightLG: 52,
      controlHeightSM: 36,
      paddingInline: 16,
      paddingBlock: 12,
      activeBorderColor: '#0071e3',
      hoverBorderColor: '#86868b',
      activeShadow: '0 0 0 4px rgba(0, 113, 227, 0.1)',
    },
    
    // Card - Apple style
    Card: {
      borderRadius: 18,
      paddingLG: 24,
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
      boxShadowSecondary: '0 4px 16px rgba(0, 0, 0, 0.12)',
      actionsBg: 'transparent',
      headerBg: 'transparent',
    },
    
    // Menu - Apple style
    Menu: {
      borderRadius: 12,
      itemBorderRadius: 8,
      itemMarginInline: 4,
      itemMarginBlock: 2,
      itemPaddingInline: 16,
      itemPaddingBlock: 12,
      subMenuItemBorderRadius: 8,
      horizontalItemBorderRadius: 8,
    },
    
    // Select - Apple style
    Select: {
      borderRadius: 12,
      controlHeight: 44,
      controlHeightLG: 52,
      controlHeightSM: 36,
    },
    
    // Modal - Apple style
    Modal: {
      borderRadius: 24,
      paddingContentHorizontal: 32,
      paddingContentVertical: 32,
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.16)',
    },
    
    // Drawer - Apple style
    Drawer: {
      borderRadius: 24,
      paddingLG: 24,
    },
    
    // Form - Apple style
    Form: {
      verticalLabelPadding: '0 0 8px',
      itemMarginBottom: 24,
      labelFontSize: 14,
      labelHeight: 22,
    },
    
    // Typography - Apple style
    Typography: {
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
      titleMarginBottom: '0.5em',
      titleMarginTop: '1.2em',
    },
    
    // Tag - Apple style
    Tag: {
      borderRadius: 6,
      paddingInline: 12,
      paddingBlock: 4,
      lineHeight: 1.4,
    },
    
    // Badge - Apple style
    Badge: {
      textFontSize: 12,
      statusSize: 8,
    },
    
    // Divider - Apple style
    Divider: {
      margin: '16px 0',
      colorSplit: '#e8e8ed',
    },
    
    // Empty - Apple style
    Empty: {
      padding: '48px 16px',
    },
    
    // Spin - Apple style
    Spin: {
      colorPrimary: '#0071e3',
    },
    
    // Skeleton - Apple style
    Skeleton: {
      borderRadius: 12,
    },
    
    // Tooltip - Apple style
    Tooltip: {
      borderRadius: 8,
      paddingBlock: 8,
      paddingInline: 12,
    },
    
    // Popover - Apple style
    Popover: {
      borderRadius: 12,
      paddingBlock: 8,
      paddingInline: 12,
    },
    
    // Dropdown - Apple style
    Dropdown: {
      borderRadius: 12,
      paddingBlock: 4,
    },
    
    // Pagination - Apple style
    Pagination: {
      itemActiveBg: '#0071e3',
      borderRadius: 8,
      itemSize: 36,
    },
  },
};

