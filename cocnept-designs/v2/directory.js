import {bindMethods} from '../../utils.js';
import {PICTURE_WIDTH, PICTURE_HEIGHT} from '../../characters/sprites/sprite-constants.js';

/**
 * Represents a DOM element in the directory.
 */
class DirectoryItem {
    constructor(onClick) {
        bindMethods(this, [
            '_onClick'
        ]);

        this.onClick = onClick;
        this._parent = null;
        this._makeElements();
    }

    _makeElements() {
        let wrapper = document.createElement('div');
        wrapper.classList.add('student');
        wrapper.addEventListener('click', this._onClick);

        let picwrap = document.createElement('div');
        picwrap.classList.add('spic');
        wrapper.appendChild(picwrap);

        let pic = document.createElement('canvas');
        pic.classList.add('spic-canvas');
        pic.width = PICTURE_WIDTH;
        pic.height = PICTURE_HEIGHT;
        let ctx = pic.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        picwrap.appendChild(pic);

        let infowrap = document.createElement('div');
        infowrap.classList.add('sinfo');
        wrapper.appendChild(infowrap);

        let name = document.createElement('p');
        name.classList.add('sname');
        infowrap.appendChild(name);

        let info = document.createElement('p');
        infowrap.appendChild(info);

        this._elems = {
            wrapper,
            ctx,
            name,
            info
        };
    }

    get wrapper() {
        return this._elems.wrapper;
    }

    _onClick() {
        if (this.onClick) {
            this.onClick(this);
        }
    }

    setSelected(selected) {
        if (selected) {
            this._elems.wrapper.classList.add('selected');
        } else {
            this._elems.wrapper.classList.remove('selected');
        }
        return this;
    }

    setStudent(pictureCache, student, selected=false) {
        let {wrapper, ctx, name, info} = this._elems;
        if (this.student !== student) {
            this.student = student;

            wrapper.id = student.id;
            pictureCache.draw(ctx, student.pictureId);
            name.innerHTML = `${student.name.last}, ${student.name.first}`;
            let disgrade = student.grade === 9 ? '09' : student.grade;
            info.innerHTML = `Grade ${disgrade} | ${student.gender} | <span class="sstatus">Enrolled</span>`;
        }
        this.setSelected(selected);
        return this;
    }

    // Note: Pass null to remove.
    addTo(parent=null) {
        if (parent !== this._parent) {
            if (this._parent) {
                this._parent.removeChild(this._elems.wrapper);
            }
            this._parent = parent;
            if (parent) {
                parent.appendChild(this._elems.wrapper);
            }
        }
        return this;
    }

    remove() {
        this.addTo(null);
        return this;
    }
}

// TODO: Get this dynamically?
// Visual height of each item in pixels
const ITEM_HEIGHT = 72;

// Extra items to have ready to show above and below (both sides, so additional
// items is double the constant) the list so the items seem to come in an instant.
const ITEM_PADDING = 2;

/**
 * Recycles DirectoryItems as the user scrolls to limit the number of elements.
 */
class Directory {
    constructor(wrapper) {
        bindMethods(this, [
            'updateScroll',
            '_onItemClicked'
        ]);

        this.wrapper = wrapper;

        // These need to be set
        this.pictureCache = null;
        this.students = [];

        // The student object of the selected item (NOT a DirectoryItem)
        this.selected = null;
        // Maps y values/a unique Symbol (if not shown) to a DirectoryItem
        this._items = new Map();

        // A dummy element to set the scroll height
        this._heightSetter = document.createElement('div');
        this._heightSetter.className = 'height-setter';
        wrapper.appendChild(this._heightSetter);

        wrapper.addEventListener('scroll', this.updateScroll);
    }

    _onItemClicked(item) {
        if (this.selected === item.student) {
            item.setSelected(false);
            this.selected = null;
        } else {
            // Mark previously selected item as unselected (if visible)
            if (this.selected) {
                let selectedItem = this._items.get(this.students.indexOf(this.selected));
                if (selectedItem) {
                    selectedItem.setSelected(false);
                }
            }

            item.setSelected(true);
            this.selected = item.student;
        }
        if (this.onSelect) {
            this.onSelect(this.selected);
        }
    }

    // Deletes all DirectoryItems
    _deleteItems() {
        for (let item of this._items.values()) {
            item.remove();
        }
        this._items.clear();
    }

    // Simply removes all visible DirectoryItems from the list
    _hideItems() {
        for (let [y, item] of this._items) {
            if (typeof y === 'number') {
                this._items.delete(y);
                this._items.set(Symbol(), item);

                item.remove();
                item.wrapper.classList.remove('selected');
            }
        }
    }

    _generateItems() {
        // Imagine that the visible list
        const itemCount = Math.ceil(this.height / ITEM_HEIGHT) + 1 + ITEM_PADDING * 2;
        for (let i = 0; i < itemCount; i++) {
            // Symbol() just means that it hasn't been assigned a y-value
            this._items.set(Symbol(), new DirectoryItem(this._onItemClicked));
        }
    }

    updateScroll() {
        let scrollY = this.wrapper.scrollTop;
        let start = Math.floor(scrollY / ITEM_HEIGHT) - ITEM_PADDING;
        let stop = Math.ceil((scrollY + this.height) / ITEM_HEIGHT) + ITEM_PADDING;
        // An array containing items that are no longer visible
        // This also removes them from this._items
        let recycleables = [...this._items]
            .filter(([y]) => {
                if (typeof y !== 'number' || y < start || y >= stop) {
                    this._items.delete(y);
                    return true;
                }
                return false;
            })
            .map(pair => pair[1]);
        for (let y = start; y < stop; y++) {
            // Do not show DirectoryItems that are out of bounds
            if (y < 0 || y >= this.students.length) continue;
            // If an item is already at this position, leave it.
            if (this._items.has(y)) continue;

            // Move a recycleable to the unclaimed position
            let recycleable = recycleables.pop();
            recycleable
                .setStudent(this.pictureCache, this.students[y], this.students[y] === this.selected)
                .addTo(this.wrapper)
                .wrapper.style.top = y * ITEM_HEIGHT + 'px';
            this._items.set(y, recycleable);
        }
        // Hide the rest
        for (let recycleable of recycleables) {
            recycleable.remove();
            this._items.set(Symbol(), recycleable);
        }
        return this;
    }

    async resize(then=Promise.resolve()) {
        let {height} = this.wrapper.getBoundingClientRect();
        await then;
        this.height = height;
        this._deleteItems();
        this._generateItems();
        return this;
    }

    // Call this when `this.students` is changed. Will not call updateScroll.
    updateData() {
        this._heightSetter.style.height = this.students.length * ITEM_HEIGHT + 'px';
        this._hideItems();
    }
}

export {
    Directory
};
