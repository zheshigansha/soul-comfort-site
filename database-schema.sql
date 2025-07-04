-- Soul Comfort Site 数据库表结构
-- 在 Supabase SQL Editor 中执行这些语句

-- 1. 用户积分表
CREATE TABLE IF NOT EXISTS user_credits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  remaining_credits INTEGER DEFAULT 0,
  total_purchased INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 对话包表
CREATE TABLE IF NOT EXISTS conversation_packages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  conversation_count INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 积分交易表
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  package_id UUID REFERENCES conversation_packages(id),
  amount INTEGER NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'purchase', 'usage', 'refund'
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'cancelled'
  reference_id VARCHAR(255), -- PayPal 订单 ID 或其他支付参考
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 用户使用记录表
CREATE TABLE IF NOT EXISTS usage_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id VARCHAR(255),
  message_count INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 支付记录表（兼容旧系统）
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan VARCHAR(100) NOT NULL,
  premium_type VARCHAR(50) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  unlimited BOOLEAN DEFAULT false,
  credits INTEGER,
  referral_code VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_user_credits_user_id ON user_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_status ON credit_transactions(status);
CREATE INDEX IF NOT EXISTS idx_usage_records_user_id ON usage_records(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);

-- 插入默认对话包数据
INSERT INTO conversation_packages (name, description, conversation_count, price) VALUES
  ('100 Credits', '100次对话', 100, 9.99),
  ('500 Credits', '500次对话 - 最受欢迎', 500, 39.99),
  ('1000 Credits', '1000次对话 - 最优惠', 1000, 69.99)
ON CONFLICT DO NOTHING;

-- 创建 RLS (Row Level Security) 策略
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- 用户只能访问自己的数据
CREATE POLICY "Users can view own credits" ON user_credits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own credits" ON user_credits
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own transactions" ON credit_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own usage" ON usage_records
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own payments" ON payments
  FOR SELECT USING (auth.uid() = user_id);

-- 服务角色可以访问所有数据（用于 API 操作）
CREATE POLICY "Service role can access all credits" ON user_credits
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access all transactions" ON credit_transactions
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access all usage" ON usage_records
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access all payments" ON payments
  FOR ALL USING (auth.role() = 'service_role'); 