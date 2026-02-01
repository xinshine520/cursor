import React from 'react'
import { Layout, Menu } from 'antd'
import { useNavigate, useLocation } from 'react-router-dom'
import { FileTextOutlined, CompressOutlined, ScissorOutlined, 
         SwapOutlined, BgColorsOutlined, HomeOutlined } from '@ant-design/icons'

const { Header } = Layout

const Navbar = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: '首页'
    },
    {
      key: '/file-convert',
      icon: <FileTextOutlined />,
      label: '文件转换'
    },
    {
      key: '/image-compress',
      icon: <CompressOutlined />,
      label: '图片压缩'
    },
    {
      key: '/image-crop',
      icon: <ScissorOutlined />,
      label: '图片裁剪'
    },
    {
      key: '/image-format',
      icon: <SwapOutlined />,
      label: '格式转换'
    },
    {
      key: '/image-watermark',
      icon: <BgColorsOutlined />,
      label: '图片水印'
    }
  ]

  return (
    <Header style={{ background: '#fff', padding: '0 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <div style={{ float: 'left', marginRight: 24, fontSize: 20, fontWeight: 'bold' }}>
        文件与图片处理工具
      </div>
      <Menu
        mode="horizontal"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={({ key }) => navigate(key)}
        style={{ borderBottom: 'none' }}
      />
    </Header>
  )
}

export default Navbar

