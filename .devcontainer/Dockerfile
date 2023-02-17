ARG aptmirror=archive.ubuntu.com
ARG username=vscode
ARG useruid=1000
ARG usergid=${useruid}
ARG node=18.13.0
ARG tz=Asia/Tokyo

FROM ubuntu:20.04 AS core

ARG tz
ENV DEBIAN_FRONTEND=nointeractive
ENV TZ=${tz}

ARG aptmirror
RUN sed -i "s@archive.ubuntu.com@${aptmirror}@g" /etc/apt/sources.list && \
    apt-get update

ARG username
ARG useruid
ARG usergid

RUN apt-get install -y --no-install-recommends \
    sudo \
    tzdata \
    wget \
    curl \
    tar \
    unzip \
    software-properties-common && \
    groupadd --gid ${usergid} ${username} && \
    useradd -s /bin/bash --uid ${useruid} --gid ${usergid} -m ${username} && \
    echo ${username} ALL=\(root\) NOPASSWD:ALL > /etc/sudoers.d/${username} && \
    chmod 0440 /etc/sudoers.d/${username}

FROM core AS downloader

WORKDIR /opt

ARG node
RUN mkdir -p /opt/usr/local && \
    chmod -R 755 /opt/usr/local && \
    # node
    wget https://nodejs.org/download/release/v${node}/node-v${node}-linux-x64.tar.gz && \
    tar -C /opt/usr/local -xvf node-v${node}-linux-x64.tar.gz && \
    mv /opt/usr/local/node-v${node}-linux-x64/ /opt/usr/local/node/ && \
    PATH=${PATH}:/opt/usr/local/node/bin npm install -g yarn

FROM core AS published

RUN add-apt-repository ppa:deadsnakes/ppa && \
    apt-get install -y --no-install-recommends \
    libwebkit2gtk-4.0-dev \
    git \
    build-essential \
    rpm \
    zip \
    fakeroot \
    pkg-config \
    libssl-dev \
    libgtk-3-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev \
    libnss3-dev \
    python3.10-dev \
    libasound2 && \
    update-alternatives --install /usr/bin/python python /usr/bin/python3.10 10 && \
    update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.10 10 

ARG username
USER ${username}

RUN curl -sSL https://install.python-poetry.org | python3 -

COPY --from=downloader /opt/usr/local /usr/local

ENV PATH=${PATH}:/usr/local/node/bin
