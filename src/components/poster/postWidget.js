import Position from './position';
import Timer from './timer';
import Post from './post';
import PostList from './postList';

export default class PostWidget {
  constructor(containerName) {
    this.containerName = containerName;
    this.postList = new PostList();

    this.onAddSubmit = this.onAddSubmit.bind(this);
    this.onWarningCancel = this.onWarningCancel.bind(this);
    this.onAddVideoSubmit = this.onAddVideoSubmit.bind(this);
    this.updateTimer = this.updateTimer.bind(this);
    this.onStopVideoAndHide = this.onStopVideoAndHide.bind(this);
    this.onWarningSubmit = this.onWarningSubmit.bind(this);
  }

  addFormMarkup() {
    return `
        <form class="create-post" name="create-post">
            <input type="text" class="post-text" name="post-text"> 
            <span class="post-video material-icons">videocam</span>
        </form>
    `;
  }

  warningFormMarkup() {
    return `
        <form class="warning" name="warning">
            <label for="warning-position">
                We're sorry.
                But something went wrong, we couldn't get your position.
                Please allow access to your position or input your position 
                into field below in format: latitude, longitude.
            </label>
            <input type="text" class="warning-position" name="warning-position" id="warning-position">
            <input type="submit" value="OK" class="warning__submit">
            <input type="button" value="Cancel" class="warning__cancel">
        </form>
    `;
  }

  bindToDOM() {
    this.container = document.querySelector(this.containerName);
  }

  bindToDOMAdd() {
    this.form = document.querySelector('.create-post');
    this.inputElem = this.form.querySelector('.post-text');
    this.videoBtn = this.form.querySelector('.post-video');
    this.videoPlayer = document.querySelector('.video');
    this.videoControls = document.querySelector('.video-controls');
    this.videoTimer = document.querySelector('.video-timer');
    this.videoSaveBtn = document.querySelector('.video-save');
    this.videoCancelBtn = document.querySelector('.video-cancel');

    this.form.addEventListener('submit', this.onAddSubmit);
    this.videoBtn.addEventListener('click', this.onAddVideoSubmit);
    this.videoSaveBtn.addEventListener('click', this.onStopVideoAndHide);
    this.videoCancelBtn.addEventListener('click', this.onStopVideoAndHide);
  }

  bindToDOMWarning() {
    this.warningForm = document.querySelector('.warning');
    this.inputPosElem = this.warningForm.querySelector('.warning-position');
    this.cancelBtn = this.warningForm.querySelector('.warning__cancel');

    this.cancelBtn.addEventListener('click', this.onWarningCancel);
  }

  renderPost(post) {
    if (post.type === 'video') {
      return `
        <div class="post" data-id="${post.id}">
            <div class="post__date">
              ${post.date.getDate().toString().padStart(2, '0')}.${post.date.getMonth().toString().padStart(2, '0')}.${post.date.getFullYear()} ${post.date.getHours().toString().padStart(2, '0')}:${post.date.getMinutes().toString().padStart(2, '0')}
            </div>
            <div class="post__content">
              <video class="${post.content.className}" src="${post.content.src}" controls>
              </video>
            </div>
            <div class="post__position">
              [${post.position.lat}, ${post.position.long}]
            </div>
        </div>
    `;
    }

    return `
        <div class="post" data-id="${post.id}">
            <div class="post__date">
              ${post.date.getDate().toString().padStart(2, '0')}.${post.date.getMonth().toString().padStart(2, '0')}.${post.date.getFullYear()} ${post.date.getHours().toString().padStart(2, '0')}:${post.date.getMinutes().toString().padStart(2, '0')}
            </div>
            <div class="post__content">
              ${post.content}
            </div>
            <div class="post__position">
              [${post.position.lat}, ${post.position.long}]
            </div>
        </div>
    `;
  }

  renderPosts() {
    const div = document.createElement('div');
    div.className = 'post-container';
    this.container.insertBefore(div, this.form);
    this.postList.posts.forEach((item) => {
      const elemCode = this.renderPost(item);
      div.insertAdjacentHTML('beforeend', elemCode);
    });
    this.postContainer = div;
  }

  renderWarning() {
    const warningForm = document.createElement('form');
    warningForm.className = 'warning';
    warningForm.name = 'warning';
    warningForm.innerHTML = this.warningFormMarkup();
    this.container.insertBefore(warningForm, null);
  }

  renderContent() {
    // render list of posts
    this.renderPosts();

    // render add form
    const addForm = document.createElement('form');
    addForm.className = 'create-post';
    addForm.name = 'create-post';
    addForm.innerHTML = this.addFormMarkup();
    this.container.insertBefore(addForm, null);

    // add listeners
    this.bindToDOMAdd();
  }

  clearPosts() {
    const posts = Array.from(this.postContainer.querySelectorAll('.post'));
    posts.forEach((item) => {
      item.remove();
    });
  }

  updatePosts() {
    this.postList.posts.forEach((item) => {
      const elemCode = this.renderPost(item);
      this.postContainer.insertAdjacentHTML('beforeend', elemCode);
    });
  }

  async createPostShowAll(content, type) {
    const post = new Post(content, type);
    try {
      await post.getPosition();
    } catch {
      // if we don't have coordinates ask for input
      this.currentPost = post;
      await this.showWarning();
    }
    this.postList.add(post);

    this.inputElem.value = '';

    // refresh list of posts
    this.clearPosts();
    this.updatePosts();
  }

  async onAddSubmit(e) {
    e.preventDefault();

    const text = this.inputElem.value.trim();

    await this.createPostShowAll(text, 'text');
  }

  async showWarning() {
    this.renderWarning();
    this.bindToDOMWarning();

    this.warningClosed = new Promise((resolve, reject) => {
      // create warning close handler, and call resolve in it
      this.warningForm.addEventListener('submit', (e) => {
        try {
          this.onWarningSubmit(e);
          resolve();
        } catch (err) {}
      });
    });

    await this.warningClosed;
  }

  onWarningSubmit(e) {
    e.preventDefault();
    const text = this.inputPosElem.value;
    try {
      this.currentPost.position = Position.checkCoords(text);
    } catch (err) {
      console.log(err);
      alert(err);
      throw new Error(err);
    }

    this.warningForm.remove();
  }

  onWarningCancel(e) {
    this.warningForm.remove();
  }

  updateTimer() {
    if (this.timer.sec === 59) {
      this.timer.min++;
      this.timer.sec = 0;
    } else {
      this.timer.sec++;
    }
    this.videoTimer.textContent = `${this.timer.min.toString().padStart(2, '0')}:${this.timer.sec.toString().padStart(2, '0')}`;
  }

  toggleVideoBlock() {
    this.videoPlayer.classList.toggle('video_active');
    this.videoControls.classList.toggle('video-controls_active');
  }

  onStopVideoAndHide(e) {
    if (e.target.className === 'video-cancel') {
      this.cancelled = true;
    }
    this.recorder.stop();
    this.stream.getTracks().forEach((track) => track.stop());
    this.toggleVideoBlock();
    this.videoBtn.classList.toggle('hidden');
  }

  async onAddVideoSubmit(e) {
    this.videoBtn.classList.toggle('hidden');

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    this.stream = stream;

    this.videoPlayer.srcObject = stream;
    this.videoPlayer.muted = true;
    this.toggleVideoBlock();
    this.form.appendChild(this.videoControls);

    this.videoPlayer.addEventListener('canplay', () => {
      this.timer = new Timer(0, 0);
      setInterval(this.updateTimer, 1000);
      this.videoPlayer.play();
    });

    const recorder = new MediaRecorder(stream);
    this.recorder = recorder;
    const chunks = [];

    recorder.addEventListener('start', () => {
      console.log('start');
      this.cancelled = false;
    });

    recorder.addEventListener('dataavailable', (event) => {
      chunks.push(event.data);
    });

    recorder.addEventListener('stop', async () => {
      // create new post with video player in it
      if (!this.cancelled) {
        const blob = new Blob(chunks);

        const player = document.createElement('video');
        player.className = 'video-post';
        player.controls = true;
        player.src = URL.createObjectURL(blob);

        await this.createPostShowAll(player, 'video');
      }
    });

    recorder.start();
  }
}
