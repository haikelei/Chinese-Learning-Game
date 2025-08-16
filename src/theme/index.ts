import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react"

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        // 暗色主题配色方案
        primary: {
          50: { value: "#f0f9ff" },
          100: { value: "#e0f2fe" },
          200: { value: "#bae6fd" },
          300: { value: "#7dd3fc" },
          400: { value: "#38bdf8" },
          500: { value: "#0ea5e9" },
          600: { value: "#0284c7" },
          700: { value: "#0369a1" },
          800: { value: "#075985" },
          900: { value: "#0c4a6e" },
          950: { value: "#082f49" }
        },
        // 暗色背景系列
        dark: {
          50: { value: "#18181b" },   // 最深的背景
          100: { value: "#27272a" },  // 主要背景
          200: { value: "#3f3f46" },  // 次要背景/卡片
          300: { value: "#52525b" },  // 边框
          400: { value: "#71717a" },  // 禁用文本
          500: { value: "#a1a1aa" },  // 次要文本
          600: { value: "#d4d4d8" },  // 主要文本
          700: { value: "#e4e4e7" },  // 高对比度文本
          800: { value: "#f4f4f5" },  // 最高对比度
          900: { value: "#fafafa" },  // 纯白
          950: { value: "#0a0a0a" }   // 最深黑
        },
        // 成功色
        success: {
          50: { value: "#f0fdf4" },
          100: { value: "#dcfce7" },
          200: { value: "#bbf7d0" },
          300: { value: "#86efac" },
          400: { value: "#4ade80" },
          500: { value: "#22c55e" },
          600: { value: "#16a34a" },
          700: { value: "#15803d" },
          800: { value: "#166534" },
          900: { value: "#14532d" },
          950: { value: "#052e16" }
        },
        // 警告色
        warning: {
          50: { value: "#fffbeb" },
          100: { value: "#fef3c7" },
          200: { value: "#fde68a" },
          300: { value: "#fcd34d" },
          400: { value: "#fbbf24" },
          500: { value: "#f59e0b" },
          600: { value: "#d97706" },
          700: { value: "#b45309" },
          800: { value: "#92400e" },
          900: { value: "#78350f" },
          950: { value: "#451a03" }
        },
        // 错误色
        error: {
          50: { value: "#fef2f2" },
          100: { value: "#fee2e2" },
          200: { value: "#fecaca" },
          300: { value: "#fca5a5" },
          400: { value: "#f87171" },
          500: { value: "#ef4444" },
          600: { value: "#dc2626" },
          700: { value: "#b91c1c" },
          800: { value: "#991b1b" },
          900: { value: "#7f1d1d" },
          950: { value: "#450a0a" }
        }
      }
    },
    semanticTokens: {
      colors: {
        // 背景色
        bg: {
          canvas: { value: { _light: "#ffffff", _dark: "{colors.dark.50}" } },
          default: { value: { _light: "#ffffff", _dark: "{colors.dark.100}" } },
          subtle: { value: { _light: "#f8fafc", _dark: "{colors.dark.200}" } },
          muted: { value: { _light: "#f1f5f9", _dark: "{colors.dark.300}" } }
        },
        // 前景色/文本色
        fg: {
          default: { value: { _light: "#0f172a", _dark: "{colors.dark.600}" } },
          muted: { value: { _light: "#64748b", _dark: "{colors.dark.500}" } },
          subtle: { value: { _light: "#94a3b8", _dark: "{colors.dark.400}" } },
          inverted: { value: { _light: "#ffffff", _dark: "{colors.dark.100}" } }
        },
        // 边框色
        border: {
          default: { value: { _light: "#e2e8f0", _dark: "{colors.dark.300}" } },
          muted: { value: { _light: "#f1f5f9", _dark: "{colors.dark.200}" } },
          subtle: { value: { _light: "#f8fafc", _dark: "{colors.dark.100}" } }
        },
        // 主要品牌色
        primary: {
          solid: { value: { _light: "{colors.primary.600}", _dark: "{colors.primary.500}" } },
          contrast: { value: { _light: "#ffffff", _dark: "{colors.dark.100}" } },
          fg: { value: { _light: "{colors.primary.600}", _dark: "{colors.primary.400}" } },
          muted: { value: { _light: "{colors.primary.100}", _dark: "{colors.primary.900}" } },
          subtle: { value: { _light: "{colors.primary.50}", _dark: "{colors.primary.950}" } },
          emphasized: { value: { _light: "{colors.primary.700}", _dark: "{colors.primary.400}" } },
          focusRing: { value: { _light: "{colors.primary.500}", _dark: "{colors.primary.400}" } }
        },
        // 成功色
        success: {
          solid: { value: { _light: "{colors.success.600}", _dark: "{colors.success.500}" } },
          contrast: { value: { _light: "#ffffff", _dark: "{colors.dark.100}" } },
          fg: { value: { _light: "{colors.success.600}", _dark: "{colors.success.400}" } },
          muted: { value: { _light: "{colors.success.100}", _dark: "{colors.success.900}" } },
          subtle: { value: { _light: "{colors.success.50}", _dark: "{colors.success.950}" } },
          emphasized: { value: { _light: "{colors.success.700}", _dark: "{colors.success.400}" } },
          focusRing: { value: { _light: "{colors.success.500}", _dark: "{colors.success.400}" } }
        },
        // 警告色
        warning: {
          solid: { value: { _light: "{colors.warning.500}", _dark: "{colors.warning.500}" } },
          contrast: { value: { _light: "#ffffff", _dark: "{colors.dark.100}" } },
          fg: { value: { _light: "{colors.warning.600}", _dark: "{colors.warning.400}" } },
          muted: { value: { _light: "{colors.warning.100}", _dark: "{colors.warning.900}" } },
          subtle: { value: { _light: "{colors.warning.50}", _dark: "{colors.warning.950}" } },
          emphasized: { value: { _light: "{colors.warning.600}", _dark: "{colors.warning.400}" } },
          focusRing: { value: { _light: "{colors.warning.500}", _dark: "{colors.warning.400}" } }
        },
        // 错误色
        error: {
          solid: { value: { _light: "{colors.error.600}", _dark: "{colors.error.500}" } },
          contrast: { value: { _light: "#ffffff", _dark: "{colors.dark.100}" } },
          fg: { value: { _light: "{colors.error.600}", _dark: "{colors.error.400}" } },
          muted: { value: { _light: "{colors.error.100}", _dark: "{colors.error.900}" } },
          subtle: { value: { _light: "{colors.error.50}", _dark: "{colors.error.950}" } },
          emphasized: { value: { _light: "{colors.error.700}", _dark: "{colors.error.400}" } },
          focusRing: { value: { _light: "{colors.error.500}", _dark: "{colors.error.400}" } }
        }
      }
    }
  },
  globalCss: {
    body: {
      bg: "bg.canvas",
      color: "fg.default",
      fontFamily: "system-ui, -apple-system, sans-serif"
    }
  }
})

export const system = createSystem(defaultConfig, config)