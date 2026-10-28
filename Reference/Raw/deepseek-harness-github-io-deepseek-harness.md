[跳至内容](https://deepseek-harness.github.io/deepseek-harness/guide/quickstart#VPContent)
# 使用 Web UI [​](https://deepseek-harness.github.io/deepseek-harness/guide/quickstart#%E4%BD%BF%E7%94%A8-web-ui)
请先按照[根目录 README](https://github.com/deepseek-ai/deepseek-harness/blob/master/README.zh.md#run) 中的说明启动 Web UI；命令会打印其访问地址。本指南从服务器已经运行的状态开始。`dsh` 进程会把启动时所在的目录作为默认文件系统位置；全新的 Web UI 则不会选中任何工作区，你需要添加一个工作区。
## 配置模型 [​](https://deepseek-harness.github.io/deepseek-harness/guide/quickstart#%E9%85%8D%E7%BD%AE%E6%A8%A1%E5%9E%8B)
打开**设置 → 模型** ，输入 [DeepSeek API 密钥](https://platform.deepseek.com/)并保存。模型路由会立即可用，不需要重启服务器。
[模型配置指南](https://deepseek-harness.github.io/deepseek-harness/guide/providers)介绍其他提供方和自定义 OpenAI 兼容端点。
## 选择工作区 [​](https://deepseek-harness.github.io/deepseek-harness/guide/quickstart#%E9%80%89%E6%8B%A9%E5%B7%A5%E4%BD%9C%E5%8C%BA)
点击**选择工作区** ，添加启动 `dsh` 时所在的项目目录，然后选中它。选中工作区前，会话输入框不可用。
## 运行任务 [​](https://deepseek-harness.github.io/deepseek-harness/guide/quickstart#%E8%BF%90%E8%A1%8C%E4%BB%BB%E5%8A%A1)
启动一个会话并发送：
> Summarize this repository and identify its main packages.
Agent（智能体）可以读取和编辑工作区文件、运行命令、委派工作并维护计划。如果根据当前权限策略，某项操作需要审批，Web UI 会先询问你。
## 继续使用 [​](https://deepseek-harness.github.io/deepseek-harness/guide/quickstart#%E7%BB%A7%E7%BB%AD%E4%BD%BF%E7%94%A8)
  * [使用 Python SDK](https://deepseek-harness.github.io/deepseek-harness/guide/python-sdk)
  * [在反向代理之后发布 Web UI](https://deepseek-harness.github.io/deepseek-harness/guide/public-deployments)


