import { NextRequest } from 'next/server';
import { getUserUsage, incrementUserUsage } from '@/lib/storage';
import { clientStorage } from '@/lib/client-storage';
import { 
  createSuccessResponse, 
  createErrorResponse, 
  ApiErrorCode,
  withErrorHandling,
  validateRequiredParams
} from '@/lib/api-response';

// 强制动态渲染
export const dynamic = 'force-dynamic'

export const GET = withErrorHandling(async (request: NextRequest) => {
  const clientId = request.nextUrl.searchParams.get('clientId');
  
  // 验证必需参数
  const validation = validateRequiredParams({ clientId }, ['clientId']);
  if (!validation.isValid) {
    return createErrorResponse(
      `Missing required parameters: ${validation.missing.join(', ')}`,
      ApiErrorCode.MISSING_PARAMS
    );
  }
  
  // 验证客户端ID格式
  if (!clientStorage.validate(clientId!)) {
    return createErrorResponse(
      'Invalid client ID format',
      ApiErrorCode.INVALID_PARAMS
    );
  }

  const usageData = await getUserUsage(clientId!);
  return createSuccessResponse(usageData);
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  const clientId = request.nextUrl.searchParams.get('clientId');
  
  // 验证必需参数
  const validation = validateRequiredParams({ clientId }, ['clientId']);
  if (!validation.isValid) {
    return createErrorResponse(
      `Missing required parameters: ${validation.missing.join(', ')}`,
      ApiErrorCode.MISSING_PARAMS
    );
  }
  
  // 验证客户端ID格式
  if (!clientStorage.validate(clientId!)) {
    return createErrorResponse(
      'Invalid client ID format',
      ApiErrorCode.INVALID_PARAMS
    );
  }

  const updatedUsageData = await incrementUserUsage(clientId!);
  return createSuccessResponse(updatedUsageData);
});