# 剩余价值计算器

## 项目简介

剩余价值计算器是一个网页应用程序，旨在帮助用户计算域名、主机或其他周期性服务的剩余价值。它考虑了多种因素，如续费金额、汇率、续费周期和剩余天数，为用户提供准确的剩余价值估算。

## 功能特点

- 支持多种货币的汇率转换
- 实时获取最新汇率数据
- 灵活的续费周期选择（月付到五年付）
- 精确的日期选择和验证
- 自动计算剩余天数
- 清晰直观的结果展示
- 响应式设计，适配各种设备

## 技术栈

- **前端**：HTML5, CSS3, JavaScript (ES6+)
- **样式**：自定义 CSS + Font Awesome 图标
- **日期选择器**：Flatpickr
- **汇率 API**：api.iloli.fun/exchange_rate

## 快速开始

1. 克隆仓库到本地：

    ```bash
    git clone https://github.com/Tomzhao1016/vps_surplus_value.git
    ```

2. 进入项目目录：

    ```bash
    cd vps_surplus_value
    ```

3. 使用您喜欢的 Web 服务器运行项目。

4. 在浏览器中访问相应的 URL 来使用应用程序。

## 使用说明

1. 选择货币并输入续费金额
2. 选择续费周期
3. 输入出价金额（如适用）
4. 选择到期日期和交易日期
5. 点击"计算剩余价值"按钮
6. 查看计算结果，包括剩余价值和溢价金额

## CORS 问题解决方案

本项目使用 CORS 代理来解决跨域请求问题。在 `script.js` 文件中，我们使用了 CORS Anywhere 服务作为临时解决方案。请注意，这种方法并不适合生产环境。

对于长期解决方案，请考虑以下选项：

1. 联系 API 提供商 (api.iloli.fun)，请求他们为您的域名添加 CORS 支持。
2. 设置自己的后端服务器，代表您的前端应用程序发出 API 请求。
3. 使用无服务器函数（例如 AWS Lambda、Vercel Serverless Functions）创建您自己的代理。

## 贡献指南

我们欢迎并感谢任何形式的贡献！如果您想为项目做出贡献，请遵循以下步骤：

1. Fork 本仓库
2. 创建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 将您的更改推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个 Pull Request

## 许可证

本项目采用 Reciprocal Public License 1.5 (RPL-1.5) 许可证。这是一个独特的开源许可证，旨在促进源代码的共享和改进。

### RPL-1.5 的主要特点：

1. **源代码可用性**：使用本软件的任何人都必须使其源代码可用。
2. **改进共享**：对软件的任何改进或修改都必须在相同的许可证下共享。
3. **商业使用**：允许商业使用，但有特定的条件。
4. **专利授权**：包含明确的专利授权条款。
5. **归属要求**：要求在使用或分发软件时提供适当的归属。

### 使用本项目时的注意事项：

- 如果您修改了本项目的代码，您必须公开发布您的修改，并使用相同的 RPL-1.5 许可证。
- 如果您在您的项目中使用了本软件，您可能需要公开您整个项目的源代码。
- 商业使用是允许的，但请仔细阅读许可证以了解具体要求。

### 重要提示

在使用、修改或分发本软件之前，请仔细阅读完整的 RPL-1.5 许可证文本。您可以在项目根目录的 [LICENSE](LICENSE.txt) 文件中找到完整的许可证文本。

如果您对如何遵守这个许可证有任何疑问，建议咨询法律专业人士。

## 联系方式

如果您有任何问题或建议，请通过以下方式联系我们：

- 项目地址：[https://github.com/Tomzhao1016/vps_surplus_value](https://github.com/Tomzhao1016/vps_surplus_value)
- 问题反馈：[https://github.com/Tomzhao1016/vps_surplus_value/issues](https://github.com/Tomzhao1016/vps_surplus_value/issues)

## 致谢

- [api.iloli.fun/exchange_rate](https://api.iloli.fun/exchange_rate) - 提供实时汇率数据
- [Flatpickr](https://flatpickr.js.org/) - 轻量级的日期选择器
- [Font Awesome](https://fontawesome.com/) - 提供优秀的图标集
