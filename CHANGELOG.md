# Changelog

All notable changes to BarFly are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0] - 2026-06-23

### Added
- Folders on the toolbar are now always kept in the pinned section. A folder
  dragged onto the dynamic section (from elsewhere, or from within the
  toolbar), created directly there, or found there on startup is
  automatically relocated to the end of the pinned section instead of
  drifting or getting evicted as dynamic items shift around it.

## [1.2.0] - 2026-06-23

### Fixed
- Folder deletion no longer silently fails to clean up orphaned toolbar
  duplicates in some cases. The previous fix relied on walking the deleted
  subtree from the removal event, but Firefox's `onRemoved` event does not
  include a removed folder's children, so that data was never there to walk.
  Orphaned duplicates are now detected by checking each tracked original's
  liveness directly.

## [1.1.0] - 2026-06-23

### Added
- Bookmarks created directly on the toolbar are relocated into a dedicated
  "Saved to Bookmarks Toolbar" folder, leaving a tracked duplicate on the bar.

### Changed
- Migrated to Manifest V3. State and self-event suppression now persist across
  service-worker restarts, and event listeners register synchronously so the
  worker wakes reliably. Minimum Firefox raised from 112 to 115.
- On startup, a toolbar bookmark with no matching original is now **adopted**
  (a backing original is created in "Saved to Bookmarks Toolbar" and the
  toolbar item is kept in place) instead of being deleted.

### Fixed
- Dragging multiple bookmarks onto the toolbar at once no longer permanently
  deletes some of them. Two distinct causes were fixed: a startup rebuild
  racing the drag events, and capacity eviction removing not-yet-processed
  drag siblings.
- Deleting a folder of bookmarks now removes their toolbar duplicates instead
  of leaving them orphaned (Firefox reports folder deletion as a single event
  covering the whole subtree).
- Dragging a folder or separator onto the toolbar no longer creates a broken,
  URL-less bookmark.
- Dragging a bookmark that is already represented on the toolbar no longer
  creates a redundant second copy.
- Restored missing browser-adapter exports and corrected event-page listener
  timing.
- Declared `data_collection_permissions` and a stable extension ID for AMO
  submission.

## [1.0.0] - 2026-06-22

### Added
- Initial release: a smart bookmarks toolbar that keeps pinned items up front
  and an LRU-cached set of dynamic items after a separator.

[1.3.0]: https://github.com/Kaapeine/Barfly/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/Kaapeine/Barfly/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/Kaapeine/Barfly/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/Kaapeine/Barfly/releases/tag/v1.0.0
