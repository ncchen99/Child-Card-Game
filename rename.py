import os
import re

def rename_files():
    # 設定圖片資料夾路徑
    folder_path = 'images'
    
    # 取得所有檔案
    files = [f for f in os.listdir(folder_path) if f.startswith('LINE_ALBUM_道具卡')]
    
    # 排序檔案（根據檔案名稱中的數字）
    files.sort(key=lambda x: int(re.search(r'(\d+)\.jpg$', x).group(1)))
    
    # 建立新舊檔名對應
    for i, old_name in enumerate(files):
        # 計算新的檔名
        level = (i // 2) + 1  # 1, 1, 2, 2, 3, 3, ...
        card = (i % 2) + 1    # 1, 2, 1, 2, 1, 2, ...
        new_name = f'card{level}-{card}.jpg'
        
        # 建立完整的檔案路徑
        old_path = os.path.join(folder_path, old_name)
        new_path = os.path.join(folder_path, new_name)
        
        # 如果新檔名已存在，先備份
        if os.path.exists(new_path):
            backup_path = os.path.join(folder_path, f'backup_{new_name}')
            os.rename(new_path, backup_path)
            print(f'備份現有檔案: {new_name} -> backup_{new_name}')
        
        # 重新命名檔案
        os.rename(old_path, new_path)
        print(f'重新命名: {old_name} -> {new_name}')

if __name__ == '__main__':
    rename_files()