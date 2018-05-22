import { PolymerElement } from '../../@polymer/polymer/polymer-element.js';
import { GestureEventListeners } from '../../@polymer/polymer/lib/mixins/gesture-event-listeners.js';
import '../../@polymer/iron-flex-layout/iron-flex-layout.js';
import '../../@kano/kwc-button/kwc-soft-button.js';
import { html } from '../../@polymer/polymer/lib/utils/html-tag.js';
class KWCPagination extends GestureEventListeners(PolymerElement) {
  static get template() {
    return html`
        <style>
            :host {
                display: block;
            }
            *[hidden] {
                display: none;
            }
            @media all and (max-width: 680px) {
                :host {
                    @apply --layout-horizontal;
                    @apply --layout-wrap;
                    @apply --layout-center;
                    @apply --layout-center-justified;
                }
                .item {
                    display: none;
                }
                kwc-soft-button ~ kwc-soft-button {
                    margin-left: 8px;
                }
            }
        </style>

        <template is="dom-if" if="[[jumpControls]]">
            <kwc-soft-button class="first" on-tap="_goToFirstPage" disabled\$="[[_isFirstPage(currentPage, totalPages)]]">
                <slot name="firstPage">&lt;&lt;</slot>
            </kwc-soft-button>
        </template>

        <template is="dom-if" if="[[paginationControls]]">
            <kwc-soft-button class="previous" on-tap="_previousPage" disabled\$="[[_isFirstPage(currentPage, totalPages)]]">
                <slot name="previousPage">PREV</slot>
            </kwc-soft-button>
        </template>

        <template is="dom-repeat" items="[[_pages]]">
            <kwc-soft-button class="item" active="[[_isActive(item, currentPage)]]" on-tap="_goToPage">
                [[item]]
            </kwc-soft-button>
        </template>

        <template is="dom-if" if="[[paginationControls]]">
            <kwc-soft-button class="next" on-tap="_nextPage" disabled\$="[[_isLastPage(currentPage, totalPages)]]">
                <slot name="nextPage">NEXT</slot>
            </kwc-soft-button>
        </template>

        <template is="dom-if" if="[[jumpControls]]">
            <kwc-soft-button class="last" on-tap="_goToLastPage" disabled\$="[[_isLastPage(currentPage, totalPages)]]">
                <slot name="lastPage">&gt;&gt;</slot>
            </kwc-soft-button>
        </template>
`;
  }

  static get is () { return 'kwc-pagination'; }
  static get properties () {
      return {
          /**
           * Set what is the number to start counting from for page
           * labels.
           */
          startsOn: {
              type: Number,
              value: 1
          },
          /**
           * Total amount of pages to paginate.
           * @type {Number}
           */
          totalPages: {
              type: Number,
              value: 1
          },
          /**
           * Which page is currently selected.
           * @type {Number}
           */
          currentPage: {
              type: Number,
              value: 1
          },
          /**
           * How many pages to display between the control buttons.
           * @type {Number}
           */
          range: {
              type: Number,
              value: 3
          },
          /**
           * Flags if pagination should display controls for "next"
           * and "previous" pages.
           * @type {Boolean}
           */
          paginationControls: {
              type: Boolean,
              default: false
          },
          /**
           * Flags if pagination should display controls for "jump to
           * first" and "jump to last" pages.
           * @type {Boolean}
           */
          jumpControls: {
              type: Boolean,
              default: false
          },
          /**
           * Array of page indexes to be displayed, calculated based
           * on the `totalPages`, `range` and the `currentPage`.
           * @type {Array}
           */
          _pages: {
              type: Array,
              computed: '_computePages(currentPage, totalPages, range)'
          },

      }
  }
  connectedCallback () {
      super.connectedCallback();
  }

  _computePages (currentPage, totalPages, range) {
      totalPages = (totalPages || 1);
      let pages = [],
          startsOn = this.startsOn;

      if (totalPages <= range) {
          /**
           * The amount of pages is smaller than the range:
           * add as many pages as there are
           */
          for (let i = startsOn; i < totalPages+startsOn; i++) {
              pages.push(i);
          }
      } else {
          /**
           * The amount of pages is bigger than the range:
           * only show a number of pages equal to the range
           *
           * If current page is not on the last pages
           */
          if (currentPage < (startsOn + totalPages - range)) {
              /**
               * Current page is in the middle of pagination
               */
              let initCount = currentPage - parseInt(range/2);
              if (initCount < startsOn) {
                  initCount = startsOn;
              }
              for (let i = initCount; i < initCount+range; i++) {
                  pages.push(i);
              }
          } else {
              /**
               * Current page is on the final pages
               */
              let initCount = startsOn + totalPages - range;
              for (let i = initCount; i < totalPages+startsOn; i++) {
                  pages.push(i);
              }
          }
      }
      return pages;
  }
  /**
   * Triggered to notify an intent to navigate to a page (from the
   * available pages on the navigation).
   * @event go-to-page
   * @param {Object} e Object containing information if the event
   *     should bubble up (`bubbles`) and the page index intended
   *    (`detail`).
   */
  /**
   * Dispath event to notify intent to navigate to a specific page
   * @param {Event} e Event triggered by tapping a page button.
   */
  _goToPage (e) {
      let page = parseInt(e.model.item);
      this.dispatchEvent(new CustomEvent(
          'go-to-page', { bubbles: false, detail: page }
      ));
  }
  /**
   * Dispath event to notify intent to navigate to the next page
   * @param {Event} e Event triggered by tapping a page button.
   */
  _nextPage (e) {
      let page = parseInt(this.currentPage);
      this.dispatchEvent(new CustomEvent(
          'go-to-page', { bubbles: false, detail: page + 1 }
      ));
  }
  /**
   * Dispath event to notify intent to navigate to the previous page
   * @param {Event} e Event triggered by tapping a page button.
   */
  _previousPage (e) {
      let page = parseInt(this.currentPage);
      this.dispatchEvent(new CustomEvent(
          'go-to-page', { bubbles: false, detail: page - 1 }
      ));
  }
  /**
   * Dispath event to notify intent to navigate to the jump to the
   * last page.
   * @param {Event} e Event triggered by tapping a page button.
   */
  _goToLastPage () {
      this.dispatchEvent(new CustomEvent(
          'go-to-page', { bubbles: false, detail: this.totalPages + this.startsOn - 1 }
      ));
  }
  /**
   * Dispath event to notify intent to navigate to the jump to the
   * first page.
   * @param {Event} e Event triggered by tapping a page button.
   */
  _goToFirstPage () {
      this.dispatchEvent(new CustomEvent(
          'go-to-page', { bubbles: false, detail: this.startsOn }
      ));
  }
  /**
   * Calculates if the given page is the currently selected/active
   * @param {Number} page Page to check if it's selected/active
   * @return {Boolean}
   */
  _isActive (page) {
      return page == this.currentPage;
  }
  /**
   * Calculates if the current page is the first page.
   * @return {Boolean}
   */
  _isFirstPage () {
      // If there are pages, check if it's the first
      if (this.totalPages > 1) {
          return parseInt(this.currentPage) == this.startsOn;
      } else {
          // Return true to disable the "previous" and "first page"
          // buttons on the navigation
          return true;
      }
  }
  /**
   * Calculates if the current page is the last page.
   * @return {Boolean}
   */
  _isLastPage () {
      if (this.totalPages > 1) {
          return parseInt(this.currentPage) == this.totalPages + this.startsOn - 1;
      } else {
          return true
      }
  }
}
window.customElements.define(KWCPagination.is, KWCPagination);
