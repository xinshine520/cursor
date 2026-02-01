import React, { useState } from 'react'
import { Upload, Button, Select, message, Card, Space, Typography } from 'antd'
import { UploadOutlined, DownloadOutlined } from '@ant-design/icons'
import axios from 'axios'

const { Option } = Select
const { Title, Text } = Typography

const FileConvert = () => {
  const [fileList, setFileList] = useState([])
  const [targetFormat, setTargetFormat] = useState('pdf')
  const [loading, setLoading] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState(null)

  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.warning('请先选择要转换的文件')
      return
    }

    setLoading(true)
    const formData = new FormData()
    formData.append('file', fileList[0].originFileObj)
    formData.append('targetFormat', targetFormat)

    try {
      const response = await axios.post('/api/convert/file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        responseType: 'blob'
      })

      const blob = new Blob([response.data])
      const url = window.URL.createObjectURL(blob)
      setDownloadUrl(url)
      message.success('文件转换成功！')
    } catch (error) {
      message.error('文件转换失败：' + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (downloadUrl) {
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = `converted.${targetFormat}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
  }

  return (
    <Card style={{ maxWidth: 800, margin: '0 auto' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Title level={2}>文件格式转换</Title>
        <Text type="secondary">支持将文档转换为不同格式</Text>

        <Space direction="vertical" style={{ width: '100%' }}>
          <Text strong>选择目标格式：</Text>
          <Select
            value={targetFormat}
            onChange={setTargetFormat}
            style={{ width: '100%' }}
          >
            <Option value="pdf">PDF</Option>
            <Option value="docx">DOCX</Option>
            <Option value="txt">TXT</Option>
            <Option value="html">HTML</Option>
          </Select>
        </Space>

        <Space direction="vertical" style={{ width: '100%' }}>
          <Text strong>上传文件：</Text>
          <Upload
            fileList={fileList}
            beforeUpload={(file) => {
              setFileList([{ uid: file.uid, name: file.name, originFileObj: file }])
              return false
            }}
            onRemove={() => setFileList([])}
            maxCount={1}
          >
            <Button icon={<UploadOutlined />}>选择文件</Button>
          </Upload>
        </Space>

        <Button
          type="primary"
          onClick={handleUpload}
          loading={loading}
          block
          size="large"
        >
          开始转换
        </Button>

        {downloadUrl && (
          <Button
            type="default"
            icon={<DownloadOutlined />}
            onClick={handleDownload}
            block
            size="large"
          >
            下载转换后的文件
          </Button>
        )}
      </Space>
    </Card>
  )
}

export default FileConvert

