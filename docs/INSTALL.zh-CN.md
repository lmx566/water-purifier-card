# Home Assistant 净水器卡片安装

仓库：<https://github.com/lmx566/water-purifier-card>

一个 JavaScript 文件提供大、中、小三张卡片，支持 11 种界面语言。卡片显示 Home Assistant 已有的实体和历史记录，不会向净水器发送启停、冲洗或复位指令。

## 先确认设备数据已接入

在 Home Assistant 的「设置 → 设备与服务 → MQTT」中确认净水器设备及其实体已经出现。设备接入 MQTT 与安装卡片是两件事；只安装卡片不会自动把设备接入 HA。

卡片中的 WATER 设备可以在可视化编辑器中选择；其他数据源也可以手动映射实体。历史曲线需要 HA Recorder 已经保存对应 TDS 实体的记录。

## 方式一：通过 HACS 自定义仓库安装

当前请使用自定义仓库方式，不要把教程写成已进入 HACS 默认收录列表。

1. 打开 HACS，点击右上角菜单，进入「自定义仓库 / Custom repositories」。
2. 仓库地址填写 `https://github.com/lmx566/water-purifier-card`。
3. 类型选择「Dashboard / 仪表盘」。部分旧版界面称为 Lovelace 或 Plugin。
4. 添加后找到 **Water Purifier Card**，选择下载。
5. 在「设置 → 仪表盘 → 右上角菜单 → 资源」确认存在一条 JavaScript 模块资源：

   ```text
   /hacsfiles/water-purifier-card/water-purifier-card.js
   ```

6. 刷新浏览器，然后编辑仪表盘、添加卡片。

三张卡片共用这一条资源，不要重复添加。若此前手动安装过，请将旧的 `/local/` 资源替换为 HACS 的资源地址，避免同时加载两份。

## 方式二：手动安装

1. 下载仓库根目录中的 [`water-purifier-card.js`](https://raw.githubusercontent.com/lmx566/water-purifier-card/main/water-purifier-card.js)，保存为 JS 文件，不要保存 GitHub 网页。
2. 放入 HA 配置目录的 `www/`，通常为 `/config/www/water-purifier-card.js`。若第一次创建 `www` 目录，重启 HA 后再继续。
3. 在仪表盘「资源」中添加以下地址，类型选择 **JavaScript 模块**：

   ```text
   /local/water-purifier-card.js?v=0.4.0
   ```

4. 刷新浏览器。升级时覆盖文件并更换该资源地址的版本参数，例如增加 `&revision=2`，以免继续使用浏览器缓存。

## 选择三种卡片

| 卡片 | 卡片类型 | 主要内容 |
| --- | --- | --- |
| 小卡：状态 | `custom:water-purifier-status-card` | 设备状态、纯水 TDS、制水时的流量 |
| 中卡：历史 | `custom:water-purifier-history-card` | 水质、TDS 历史、累计用量、滤芯提醒 |
| 大卡：完整 | `custom:water-purifier-card` | 水质、水路示意、滤芯及诊断信息 |

在卡片选择器中搜索「净水器」或 `Water Purifier`，选择样式，再在编辑器内选择 WATER 设备。可以在同一个仪表盘中同时放置三种卡片。

也可以添加「手动」卡片，先填以下最小配置，再切换可视化编辑器选择设备：

```yaml
type: custom:water-purifier-status-card
language: auto
```

中卡示例：

```yaml
type: custom:water-purifier-history-card
language: auto
history_hours: 6
```

大卡示例：

```yaml
type: custom:water-purifier-card
language: auto
show_history: true
history_hours: 1
```

`language: auto` 跟随 HA 当前用户的语言。也可填写 `zh-Hans`、`zh-Hant`、`en`、`de`、`fr`、`es`、`it`、`nl`、`pt-BR`、`ja` 或 `ko`。自定义 `title` 不会自动翻译；省略它会使用当前语言的默认标题。

如果手写 `device_id`，应使用 HA 的设备注册 ID，不是固件中的 `water_<MAC>` 标识。完整实体映射见 [小卡示例](../examples/status-card.yaml)、[中卡示例](../examples/history-card.yaml) 和 [大卡示例](../examples/configuration.yaml)，示例实体 ID 必须替换为实际值。

## 教程中需要说明的数据含义

- 中卡「累计纯水量、累计废水量、累计制水时间、启动次数」是设备累计值，不是当天或图表时间范围内的统计。
- TDS 曲线来自 HA Recorder，不是净水器 Flash 中的历史分区。刚接入时可能暂时没有历史。
- 滤芯显示设备上报的维护提醒，不会凭空估算剩余天数或寿命百分比。
- 状态区不再额外拼接正常 UV 开关说明；实际故障原因仍会显示。大卡保留 UV 部件及详细信息。
- 卡片只读；需要调整设备设置时，使用设备自己的管理后台。

## 常见问题

**提示 Custom element doesn't exist**：检查资源路径、资源类型和文件是否成功加载，然后刷新。只需要加载一次 JS。

**没有找到 WATER 设备**：先确认 MQTT 设备已经进入 HA，或在编辑器中手动映射实体。

**有读数但没有曲线**：检查该实体是否有 Recorder 历史、是否被排除，以及所选时间范围是否有数据。

**更新后还是旧文字**：手动安装时覆盖文件并修改资源版本参数，再刷新；HACS 安装则完成下载后刷新浏览器。

当前验证范围及后续未重测的显示调整见 [验证记录](FRONTEND-VALIDATION.md)。HACS 自定义仓库安装与默认列表收录是不同流程，官方说明见 [HACS 自定义仓库](https://www.hacs.xyz/docs/faq/custom_repositories/)。
