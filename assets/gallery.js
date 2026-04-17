// ==================================================
// 配置設置 - 請直接修改以下配置
// ==================================================
const config = {
  // GitHub 倉庫信息
  repoOwner: 'x200706', // 請修改為你的 GitHub 使用者名稱
  repoName: 'repo2album', // 請修改為你的 GitHub 倉庫名
  branch: 'main', // 部署分支，通常為 main

  // 相簿配置
  albumsPath: 'albums', // 相簿存放的資料夾名稱
  
  // 支援的圖片格式
  supportedImageFormats: ['jpg', 'jpeg', 'png', 'webp'],
  
  // API 請求配置
  apiBaseUrl: 'https://api.github.com',
  rawBaseUrl: 'https://raw.githubusercontent.com',
  
  // 外觀配置
  siteTitle: 'repo2album', // 網站標題
  siteDescription: '把Github倉庫秒變公開相簿' // 網站描述
};

// DOM 元素引用
const elements = {
  albumsContainer: document.getElementById('albums-container'),
  albumDetails: document.getElementById('album-details'),
  albumTitle: document.getElementById('album-title'),
  photosContainer: document.getElementById('photos-container'),
  backToAlbumsBtn: document.getElementById('back-to-albums')
};

// 簡單的圖片預覽功能
let previewModal = null;

// 初始化應用
async function initApp() {
  try {    
    // 依照設定更新網站標題和描述
    if (config.siteTitle) {
      document.querySelector('h1').textContent = config.siteTitle;
    }
    if (config.siteDescription) {
      document.querySelector('p.text-accent').textContent = config.siteDescription;
    }
    
    console.log('配置已加載:', config);
    
    console.log('配置加載成功:', {
      repoOwner: config.repoOwner,
      repoName: config.repoName,
      branch: config.branch,
      albumsPath: config.albumsPath
    });
    
    // 載入相簿列表
    loadAlbums();
    
    // 綁定返回按鈕事件
    elements.backToAlbumsBtn.addEventListener('click', showAlbumsList);
    
    // 處理 URL 參數，檢查能否直接訪問相簿
    const urlParams = new URLSearchParams(window.location.search);
    const albumName = urlParams.get('album');
    if (albumName) {
      loadAlbumPhotos(decodeURIComponent(albumName));
    }
  } catch (error) {
    console.error('初始化應用失敗:', error);
    elements.albumsContainer.innerHTML = `
      <div class="col-span-full error-message">
        <i class="fa fa-exclamation-circle mr-2"></i>
        初始化應用失敗，請檢查配置文件或網絡連接
      </div>
    `;
  }
}

// 載入所有相簿
async function loadAlbums() {
  try {
    // 清空容器
    elements.albumsContainer.innerHTML = `
      <div class="col-span-full text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p class="mt-4 text-accent">正在載入相簿...</p>
      </div>
    `;
    
    console.log(`開始加載載入列表，相簿根路徑: ${config.albumsPath}`);
    
    // 調用 GitHub API 取得 albums 資料夾內容
    const albumsData = await fetchGitHubContents(config.albumsPath);
    
    // 打印原始數據
    console.log('相簿列表原始數據:', albumsData);
    
    // 過濾出資料夾（相簿）
    const albums = albumsData.filter(item => item.type === 'dir');
    console.log(`找到 ${albums.length} 個相簿資料夾`);
    
    // 如果沒有相簿
    if (albums.length === 0) {
      elements.albumsContainer.innerHTML = `
        <div class="col-span-full empty-state">
          <i class="fa fa-folder-open-o"></i>
          <h3 class="text-xl font-semibold mb-2">沒有相簿</h3>
          <p>在 albums 資料夾中創建子資料夾來添加相簿</p>
        </div>
      `;
      return;
    }
    
    // 加載每個相簿的封面和照片數量
    const albumsWithInfo = await Promise.all(albums.map(async (album) => {
      try {
        console.log(`正在處理相簿: ${album.name}`);
        
        // 獲取相簿中的所有文件
        const photosData = await fetchGitHubContents(`${config.albumsPath}/${album.name}`);
        
        console.log(`相簿 ${album.name} 的原始數據:`, photosData);
        
        // 檢查返回的數據是否為數組
        if (!Array.isArray(photosData)) {
          console.error(`相簿 ${album.name} 返回的數據不是array:`, photosData);
          return {
            ...album,
            coverPhoto: null,
            photoCount: 0
          };
        }
        
        // 印出所有檔案列表
        const allFiles = photosData.map(item => `${item.name} (${item.type})`).join(', ');
        console.log(`相簿 ${album.name} 中的所有檔案: ${allFiles}`);
        
        // 過濾出支援的圖片檔案
        const photos = photosData.filter(item => {
          if (item.type !== 'file') {
            console.log(`跳過非支援檔案類型: ${item.name} (${item.type})`);
            return false;
          }
          
          const extension = item.name.split('.').pop().toLowerCase();
          const isSupported = config.supportedImageFormats.includes(extension);
          console.log(`檢查檔案: ${item.name}, 格式: ${extension}, 支援: ${isSupported}`);
          return isSupported;
        });
        
        console.log(`相簿 ${album.name} 中找到 ${photos.length} 張支援的照片`);
        
        // 獲取第一張圖片作為封面
        const coverPhoto = photos.length > 0 ? photos[0] : null;
        
        if (coverPhoto) {
          console.log(`相簿 ${album.name} 的封面照片: ${coverPhoto.name}`);
        } else {
          console.log(`相簿 ${album.name} 沒有找到封面照片`);
        }
        
        return {
          ...album,
          coverPhoto,
          photoCount: photos.length
        };
      } catch (error) {
        console.error(`載入相簿 ${album.name} 資訊時出錯:`, error);
        return {
          ...album,
          coverPhoto: null,
          photoCount: 0
        };
      }
    }));
    
    // 過濾掉沒有照片的相簿
    const validAlbums = albumsWithInfo.filter(album => album.photoCount > 0);
    
    // 渲染相簿列表
    renderAlbums(validAlbums);
  } catch (error) {
    console.error('載入相簿列表時出錯:', error);
    elements.albumsContainer.innerHTML = `
      <div class="col-span-full error-message">
        <i class="fa fa-exclamation-circle mr-2"></i>
        載入相簿列表失敗，請檢查網絡連接或稍後再試
      </div>
    `;
  }
}

// 渲染相簿列表
function renderAlbums(albums) {
  // 清空容器
  elements.albumsContainer.innerHTML = '';
  
  // 渲染每個相簿卡片
  albums.forEach((album, index) => {
    // 創建相簿卡片元素
    const albumCard = document.createElement('div');
    albumCard.className = 'album-card fade-in';
    albumCard.style.animationDelay = `${index * 0.1}s`;
    
    // 相簿封面圖片 URL
    let coverUrl = '';
    if (album.coverPhoto) {
      console.log(`為相簿 ${album.name} 生成封面 URL，照片路徑: ${album.coverPhoto.path}`);
      coverUrl = getRawFileUrl(album.coverPhoto.path);
      console.log(`相簿 ${album.name} 的封面 URL: ${coverUrl}`);
    } else {
      // 如果沒有封面圖片，使用預設圖片
      console.log(`相簿 ${album.name} 沒有封面照片，使用預設圖片`);
      coverUrl = 'https://raw.githubusercontent.com/x200706/repo2album/refs/heads/main/no_image.png';
    }
    
    // 設置相簿卡片內容，含錯誤處理
    albumCard.innerHTML = `
      <div class="relative overflow-hidden">
        <img 
          src="${coverUrl}" 
          alt="${album.name}" 
          class="album-card-image"
          onerror="this.onerror=null; this.src='https://raw.githubusercontent.com/x200706/repo2album/refs/heads/main/no_image.png'; console.error('封面圖片載入失敗:', this.src)"
        >
      </div>
      <div class="album-card-content">
        <h3 class="album-card-title">${album.name}</h3>
        <p class="album-card-count">${album.photoCount} 張照片</p>
      </div>
    `;
    
    // 點擊相簿卡片，載入相簿照片
    albumCard.addEventListener('click', () => {
      loadAlbumPhotos(album.name);
    });
    
    // 加入容器
    elements.albumsContainer.appendChild(albumCard);
  });
}

// 載入相簿中的照片
async function loadAlbumPhotos(albumName) {
  try {
    console.log(`開始載入相簿照片，相簿名稱: ${albumName}`);
    
    // 更新 URL 參數，以便可以直接分享相簿鏈接
    const url = new URL(window.location);
    url.searchParams.set('album', albumName);
    window.history.pushState({}, '', url);
    
    // 顯示相簿詳情頁，隱藏相簿列表
    showAlbumDetails(albumName);
    
    // 清空照片容器
    elements.photosContainer.innerHTML = `
      <div class="col-span-full text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p class="mt-4 text-accent">正在載入照片...</p>
      </div>
    `;
    
    // 構建相簿路徑
    const albumPath = `${config.albumsPath}/${albumName}`;
    console.log(`相簿完整路徑: ${albumPath}`);
    
    // 調用 GitHub API 取得相簿中的所有檔案
    const photosData = await fetchGitHubContents(albumPath);
    
    // 印出原始資料
    console.log('照片列表原始資料:', photosData);
    
    // 過濾出支援的圖片檔案
    const photos = photosData.filter(item => {
      if (item.type !== 'file') return false;
      const extension = item.name.split('.').pop().toLowerCase();
      return config.supportedImageFormats.includes(extension);
    });
    
    // 如果沒有照片
    if (photos.length === 0) {
      elements.photosContainer.innerHTML = `
        <div class="col-span-full empty-state">
          <i class="fa fa-picture-o"></i>
          <h3 class="text-xl font-semibold mb-2">沒有照片</h3>
          <p>這個相簿還沒有照片</p>
        </div>
      `;
      return;
    }
    
    // 渲染照片列表
    renderPhotos(photos, albumName);
  } catch (error) {
    console.error(`載入相簿 ${albumName} 照片時出錯:`, error);
    elements.photosContainer.innerHTML = `
      <div class="col-span-full error-message">
        <i class="fa fa-exclamation-circle mr-2"></i>
        載入照片失敗，請檢查網絡連線或稍後再試
      </div>
    `;
  }
}

// 渲染照片列表
function renderPhotos(photos, albumName) {
  // 清空容器
  elements.photosContainer.innerHTML = '';
  
  // 為 PhotoSwipe 準備數據
  const galleryItems = [];
  
  // 渲染每張照片
  photos.forEach((photo, index) => {
    // 照片 URL
    const photoUrl = getRawFileUrl(photo.path);
    
    // 建立照片卡片元素
    const photoCard = document.createElement('div');
    photoCard.className = 'photo-card fade-in';
    photoCard.style.animationDelay = `${index * 0.05}s`;
    
    // 設置照片卡片內容
    photoCard.innerHTML = `
      <div class="relative overflow-hidden">
        <img 
          src="${photoUrl}" 
          alt="${photo.name}" 
          class="photo-image lazy" 
          data-src="${photoUrl}"
          loading="lazy"
        >
      </div>
    `;
    
    // 添加到容器
    elements.photosContainer.appendChild(photoCard);
    
    // 點擊照片，打開簡單預覽
    photoCard.addEventListener('click', () => {
      console.log(`點擊照片 ${index}: ${photo.name}`);
      openImagePreview(photoUrl, photo.name);
    });
  });
  
  // 初始化圖片惰性載入
  initLazyLoading();
}

// 初始化圖片惰性載入
function initLazyLoading() {
  const lazyImages = document.querySelectorAll('img.lazy');
  
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.remove('lazy');
          imageObserver.unobserve(img);
        }
      });
    });
    
    lazyImages.forEach(img => imageObserver.observe(img));
  } else {
    // 回滾方案，適用於不支持 IntersectionObserver 的瀏覽器
    lazyImages.forEach(img => {
      img.src = img.dataset.src;
      img.classList.remove('lazy');
    });
  }
}

// 打開簡單的圖片預覽
function openImagePreview(imageUrl, imageName) {
  console.log('打開圖片預覽:', imageName);
  
  // 如果已經有預覽視窗，先移除
  if (previewModal) {
    document.body.removeChild(previewModal);
  }
  
  // 建立預覽視窗元素
  previewModal = document.createElement('div');
  previewModal.className = 'fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4 transition-opacity duration-300 opacity-0';
  previewModal.id = 'image-preview-modal';
  
  // 預覽視窗內容
  previewModal.innerHTML = `
    <div class="relative max-w-6xl max-h-[90vh] w-full">
      <!-- 關閉按鈕 -->
      <button class="absolute top-4 right-4 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full w-10 h-10 flex items-center justify-center transition-colors z-10" onclick="closeImagePreview()">
        <i class="fa fa-times"></i>
      </button>
      
      <!-- 圖片容器 -->
      <div class="bg-white bg-opacity-10 rounded-lg overflow-hidden shadow-2xl">
        <img 
          src="${imageUrl}" 
          alt="${imageName}" 
          class="max-w-full max-h-[80vh] object-contain mx-auto"
          onclick="closeImagePreview()"
        >
        <div class="p-4 text-white text-center">
          <p class="text-sm truncate">${imageName}</p>
          <p class="text-xs text-gray-300 mt-1">點擊圖片或按 ESC 關閉</p>
        </div>
      </div>
    </div>
  `;
  
  // 添加到頁面
  document.body.appendChild(previewModal);
  
  // 添加淡入動畫
  setTimeout(() => {
    previewModal.classList.add('opacity-100');
  }, 10);
  
  // 添加 ESC 鍵關閉功能
  const handleEscKey = (e) => {
    if (e.key === 'Escape') {
      closeImagePreview();
      document.removeEventListener('keydown', handleEscKey);
    }
  };
  document.addEventListener('keydown', handleEscKey);
  
  // 點擊背景關閉
  previewModal.addEventListener('click', (e) => {
    if (e.target === previewModal) {
      closeImagePreview();
    }
  });
}

// 關閉圖片預覽
function closeImagePreview() {
  if (previewModal) {
    // 淡出動畫
    previewModal.classList.remove('opacity-100');
    previewModal.classList.add('opacity-0');
    
    // 移除元素
    setTimeout(() => {
      if (previewModal && document.body.contains(previewModal)) {
        document.body.removeChild(previewModal);
        previewModal = null;
      }
    }, 300);
    
    // 移除 ESC 鍵監聽
    document.removeEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeImagePreview();
    });
  }
}

// 顯示相簿列表
function showAlbumsList() {
  // 更新 URL，移除相簿參數
  const url = new URL(window.location);
  url.searchParams.delete('album');
  window.history.pushState({}, '', url);
  
  // 顯示相簿列表，隱藏相簿詳情
  elements.albumsContainer.classList.remove('hidden');
  elements.albumDetails.classList.add('hidden');
  
  // 關閉任何打開的預覽
  closeImagePreview();
}

// 顯示相簿詳情
function showAlbumDetails(albumName) {
  // 設置相簿標題
  elements.albumTitle.textContent = albumName;
  
  // 顯示相簿詳情，隱藏相簿列表
  elements.albumsContainer.classList.add('hidden');
  elements.albumDetails.classList.remove('hidden');
}

// 調用 GitHub API 取得內容
async function fetchGitHubContents(path) {
  // 嚴格使用 URL 編碼，確保中文路徑正確處理
  // 首先將路徑按 '/' 分割，然後對每部分分別編碼，最後重新組合
  const pathParts = path.split('/');
  const encodedPathParts = pathParts.map(part => encodeURIComponent(part));
  const encodedPath = encodedPathParts.join('/');
  
  const apiUrl = `${config.apiBaseUrl}/repos/${config.repoOwner}/${config.repoName}/contents/${encodedPath}?ref=${config.branch}`;
  
  try {
    console.log(`正在請求 GitHub API: ${apiUrl}`);
    console.log(`原始路徑: ${path}`);
    console.log(`encode後路徑: ${encodedPath}`);
    
    const response = await fetch(apiUrl);
    
    // 檢查回應狀態
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API 請求失敗: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`API 請求失敗: ${response.status} ${response.statusText}\n${errorText}`);
    }
    
    const data = await response.json();
    console.log(`API 請求成功，返回 ${data.length || 0} 個項目`);
    console.log('返回的資料範例:', data.length > 0 ? data[0] : '無數據');
    return data;
  } catch (error) {
    console.error(`取得 ${path} 內容時出錯:`, error);
    
    // 顯示更詳細的錯誤信息
    elements.albumsContainer.innerHTML = `
      <div class="col-span-full error-message">
        <i class="fa fa-exclamation-circle mr-2"></i>
        載入失敗: ${error.message}
        <div class="mt-2 text-sm">
          請檢查以下內容:
          <ul class="list-disc pl-5 mt-1">
            <li>GitHub 使用者名和倉庫名是否正確</li>
            <li>倉庫是否為公開</li>
            <li>網絡連線是否正常</li>
            <li>GitHub API 限制是否已達到</li>
            <li>中文路徑是否正確編碼</li>
          </ul>
          <div class="mt-2">
            原始路徑: ${path}<br>
            encode後路徑: ${encodedPath}<br>
            請嘗試手動訪問: <a href="${apiUrl}" target="_blank" class="text-blue-500 underline">${apiUrl}</a>
          </div>
        </div>
      </div>
    `;
    
    throw error;
  }
}

// 獲取 GitHub Raw 文件 URL
function getRawFileUrl(path) {
  // 嚴格使用 URL 編碼，確保中文路徑正確處理
  // 首先將路徑按 '/' 分割，然後對每部分分別編碼，最後重新組合
  const pathParts = path.split('/');
  const encodedPathParts = pathParts.map(part => encodeURIComponent(part));
  const encodedPath = encodedPathParts.join('/');
  
  const rawUrl = `${config.rawBaseUrl}/${config.repoOwner}/${config.repoName}/${config.branch}/${encodedPath}`;
  console.log(`生成 Raw 文件 URL:`);
  console.log(`  原始路徑: ${path}`);
  console.log(`  encode後路徑: ${encodedPath}`);
  console.log(`  完整 URL: ${rawUrl}`);
  return rawUrl;
}

// 當頁面加載完成時初始化應用
document.addEventListener('DOMContentLoaded', initApp);

// 處理瀏覽器後退/前進按鈕
window.addEventListener('popstate', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const albumName = urlParams.get('album');
  
  if (albumName) {
    loadAlbumPhotos(decodeURIComponent(albumName));
  } else {
    showAlbumsList();
  }
});