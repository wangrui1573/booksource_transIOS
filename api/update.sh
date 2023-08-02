screen -ls | grep "book_source" | cut -d. -f1 | awk '{print $1}' | xargs kill 
rm -rf /docker/book_source/app/
git clone https://ghproxy.com/https://github.com/wangrui1573/booksource_transIOS.git /docker/book_source/app
screen -S book_source python3 /docker/book_source/app/api/conv_book_web.py
