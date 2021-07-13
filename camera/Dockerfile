FROM python:3

RUN apt-get update \
    && apt-get install -y \
    build-essential \
    cmake \
    git \
    wget \
    unzip \
    yasm \
    pkg-config \
    libswscale-dev \
    libtbb2 \
    libtbb-dev \
    libjpeg-dev \
    libpng-dev \
    libtiff-dev \
    libavformat-dev \
    libpq-dev \
    cups \
    libcups2-dev \
    && rm -rf /var/lib/apt/lists/*




WORKDIR /opt/app
ADD src /opt/app

RUN pip install -r requirements.txt

CMD [ "python", "main.py"]