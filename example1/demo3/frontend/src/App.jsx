import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Layout } from 'antd'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import FileConvert from './pages/FileConvert'
import ImageCompress from './pages/ImageCompress'
import ImageCrop from './pages/ImageCrop'
import ImageFormat from './pages/ImageFormat'
import ImageWatermark from './pages/ImageWatermark'
import './App.css'

const { Content } = Layout

function App() {
  return (
    <Router>
      <Layout className="app-layout">
        <Navbar />
        <Content className="app-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/file-convert" element={<FileConvert />} />
            <Route path="/image-compress" element={<ImageCompress />} />
            <Route path="/image-crop" element={<ImageCrop />} />
            <Route path="/image-format" element={<ImageFormat />} />
            <Route path="/image-watermark" element={<ImageWatermark />} />
          </Routes>
        </Content>
      </Layout>
    </Router>
  )
}

export default App

