from PIL import Image
import os

def adjust_image_size():
    # 設定圖片資料夾路徑
    folder_path = 'images'
    # 背景顏色 #E4E5DD
    bg_color = (228, 229, 221)
    
    # 獲取所有卡片圖片並排序
    image_files = sorted([f for f in os.listdir(folder_path) if f.startswith('card') and f.endswith('.jpg')])
    
    if not image_files:
        print("找不到卡片圖片")
        return
    
    print("找到以下圖片檔案：")
    for f in image_files:
        print(f"- {f}")
    
    # 先找出最大寬度和高度
    max_width = 0
    max_height = 0
    images_info = []
    
    # 第一次掃描：獲取所有圖片資訊
    print("\n檢查圖片尺寸：")
    for filename in image_files:
        filepath = os.path.join(folder_path, filename)
        with Image.open(filepath) as img:
            width, height = img.size
            print(f"{filename}: {width}x{height}")
            max_width = max(max_width, width)
            max_height = max(max_height, height)
            images_info.append({
                'filename': filename,
                'width': width,
                'height': height,
                'path': filepath
            })
    
    print(f"\n目標尺寸: {max_width}x{max_height}像素")
    
    # 調整每張圖片的尺寸
    print("\n開始調整圖片：")
    for img_info in images_info:
        print(f"\n處理 {img_info['filename']}:")
        print(f"當前尺寸: {img_info['width']}x{img_info['height']}")
        print(f"目標尺寸: {max_width}x{max_height}")
        
        if img_info['width'] < max_width or img_info['height'] < max_height:
            with Image.open(img_info['path']) as img:
                # 確保圖片模式是 RGB
                if img.mode != 'RGB':
                    print(f"轉換圖片模式從 {img.mode} 到 RGB")
                    img = img.convert('RGB')
                
                # 計算新的尺寸，保持比例
                aspect_ratio = img_info['width'] / img_info['height']
                if aspect_ratio > (max_width / max_height):
                    new_height = max_height
                    new_width = int(max_height * aspect_ratio)
                else:
                    new_width = max_width
                    new_height = int(max_width / aspect_ratio)

                # 創建新的圖片，使用背景色填充
                new_img = Image.new('RGB', (max_width, max_height), bg_color)

                # 計算偏移量，使圖片置中
                x_offset = (max_width - new_width) // 2
                y_offset = (max_height - new_height) // 2
                print(f"水平偏移: {x_offset}像素, 垂直偏移: {y_offset}像素")
                
                # 調整圖片大小
                img = img.resize((new_width, new_height), Image.LANCZOS)
                # 將原圖貼上，置中對齊
                new_img.paste(img, (x_offset, y_offset))
                
                # 備份原圖
                backup_path = os.path.join(folder_path, f"backup_{img_info['filename']}")
                if not os.path.exists(backup_path):
                    img.save(backup_path)
                    print(f"已備份原圖到 {backup_path}")
                
                # 保存調整後的圖片
                new_img.save(img_info['path'], quality=95)
                print(f"已成功調整並保存圖片")
                
                # 驗證新圖片
                with Image.open(img_info['path']) as verify_img:
                    new_width, new_height = verify_img.size
                    print(f"驗證新圖片尺寸: {new_width}x{new_height}")
                    if new_width != max_width or new_height != max_height:
                        print("警告：調整後的尺寸不符合預期！")
        else:
            print("圖片尺寸已經符合要求，不需要調整")

if __name__ == '__main__':
    adjust_image_size() 