{View} = require 'atom-space-pen-views'

module.exports =
class StatusView extends View

  @content: ->
    @div {class: "inline-block"}, =>
      @span "0", {class: "icon icon-cloud-download", outlet: "download"}
      @span "0", {class: "icon icon-cloud-upload", outlet: "upload"}

  initialize: ->
    @uploadCount = 0;
    @downloadCount = 0;
    @hide();
    @upload.hide();
    @download.hide();

  setUploadCount: (@uploadCount) ->
    @upload.text(@uploadCount);
    @refreshVisible();

  setDownloadCount: (@downloadCount) ->
    @download.text(@downloadCount);
    @refreshVisible();

  refreshVisible: ->
    if (@uploadCount + @downloadCount) == 0
      @hide();
    else
      if @uploadCount == 0
        @upload.hide();
      else
        @upload.show();

      if @downloadCount == 0
        @download.hide();
      else
        @download.show();
        
      @show();
