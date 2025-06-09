export const API_CONFIG = {
  BASE_URL: 'https://cloud.siliconflow.cn',
  MODEL_PATH: '/api/v1/chat/completions',
  // 如需切换Moonshot请改为MOONSHOT_API_KEY，如需Silu请改为SILU_API_KEY
  API_KEY: process.env.SILU_API_KEY || process.env.MOONSHOT_API_KEY || '',
  MODEL_NAME: 'Qwen3-30B-A3B' // 请根据你的实际模型名修改
};

export const getApiHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${API_CONFIG.API_KEY}`,
}); 