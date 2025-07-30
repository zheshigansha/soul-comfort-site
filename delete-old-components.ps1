# 删除已移动的组件文件
$filesToDelete = @(
    "components\ui\ChatInterface.tsx",
    "components\ui\ChatMessage.tsx",
    "components\ui\ChatInput.tsx",
    "components\ui\ModeSelector.tsx",
    "components\ui\QuoteCard.tsx",
    "components\ui\Container.tsx",
    "components\ui\button.tsx",
    "components\ui\Navbar.tsx",
    "components\ui\NavbarClient.tsx",
    "components\ui\LocaleSwitcher.tsx",
    "components\ui\LogoutButton.tsx"
)

foreach ($file in $filesToDelete) {
    if (Test-Path $file) {
        Write-Host "删除文件: $file"
        Remove-Item $file -Force
    } else {
        Write-Host "文件不存在: $file"
    }
}

Write-Host "旧组件文件删除完成！" 