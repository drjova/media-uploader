(function($){
  function image(filename,fullUrl,metaData) {
    this.filename= filename,
    this.fullUrl= fullUrl,
    this.metaData= metaData,
    this.title= null,
    this.getFilename= function(){
      return this.filename;
    },
    this.getFullUrl= function(){
      return this.fullUrl;
    },
    this.getIconUrl= function(){
      return this.iconUrl;
    },
    this.getMetaData= function(){
      return this.metaData;
    },
    this.setTitle= function(title){
        this.title = title;
    },
    this.getTitle= function(){
        return this.title;
    },
    this.getInfo= function(){
      return this;
    },
    this.getMetaArtist=function(){
       if('undefined' !== typeof this.metaData['Exif.Image.Artist'] && this.metaData['Exif.Image.Artist'] != ''){
            return this.metaData['Exif.Image.Artist'];   
        }else{
          return null;
        }
    },
    this.getMetaDescription= function(){
        if('undefined' !== typeof this.metaData['Exif.Image.ImageDescription'] && this.metaData['Exif.Image.ImageDescription'] != ''){
            return this.metaData['Exif.Image.ImageDescription'];   
        }else{
            return null;
        }
    },
    this.getMetaCopyright=function(){
         if('undefined' !== typeof this.metaData['Exif.Image.Copyright'] && this.metaData['Exif.Image.Copyright'] != ''){
            return this.metaData['Exif.Image.Copyright'];   
        }else{
            return null;
        }
    },
    this.getMetaDate=function(){
      if('undefined' !== typeof this.metaData['Exif.Photo.DateTimeOriginal'] && this.metaData['Exif.Photo.DateTimeOriginal'] != ''){
            return this.metaData['Exif.Photo.DateTimeOriginal'];   
        }else{
            return null;
        }
    },
    this.getMetaKeywords=function(){
     if('undefined' !== typeof this.metaData['Exif.Photo.UserComment'] && this.metaData['Exif.Photo.UserComment'] != ''){
            return this.metaData['Exif.Photo.UserComment'];   
        }else{
            return null;
        }
    },
    this.doit = function(){
      alert(this.filename);
    }
}
    $.theUploader = function(el, type, options){
       var base = this;
        base.$el = $(el);
        base.el = el;
        base.$el.data("theUploader", base);
       
        base.meta = {
          aurthors:[],
          descriptions:[],
          copyrights:[],
          keywords:[]
        }

    base.images = {};
    base.init = function(){
          $('body').on('click','.remove_image',function(){
              var that = this
              base.delete_image($(that))
          })
          if( typeof( type ) === "undefined" || type === null ) type = "handler";
          base.type = type;
          base.options = $.extend({},$.theUploader.defaultOptions, options);
          if(base.options.hasPopup){
                   
          }else{
              base.$el.html('<div id="dropzone"><div id="dropzone-container"><div id="drop-zone-label"><h2>Drop files here <small>It also support to drop folders</small></h2></div><div id="filelist"></div></div></div>')
              base.loadUploader('dropzone','drop-zone-label')
          }
          base.get_previous();
    };
    base.get_previous = function(){
       
       $.get(base.options.site_url+'/submit/get_uploaded_images',base.options.formData,function(data){
              
              if(data){
                 $.each($.parseJSON(data),function(){
                  var im = new image(this.filename,this.image,$.parseJSON(this.metadata)) 
                  base.images[this.filename] = im
                  base.check_for_metadata($.parseJSON(this.metadata));

                var to_render = {
                      image:this.image,
                      filename:this.filename,
                      description:im.getMetaDescription()
                }
                var output = Mustache.to_html(base.options.template, to_render);
                  $('#filelist').append(output)
               
                 })
              }
        })
    }
    base.if_contain_tags = function(data,needle){
        if('undefined' !== typeof data[needle] && data[needle] != ''){
            return data[needle];   
        }else{
            return false;
        }
    }
    base.if_has_it = function(data,needle){
        var has_it = false;
        for (var i = 0; i < data.length; i++) {
              if(data[i] == needle){
                has_it = true;
                break;
              }
        };
        return has_it;
    },
    base.findIndex=function(data,needle){
        var has_it = false;
        for (var i = 0; i < data.length; i++) {
              if(data[i] == needle){
                has_it = i;
                break;
              }
        };
        return has_it;
    },
    base.delete_image = function(item){
      var filename = item.data('id')
      var data = $.extend({},base.options.formData,{filename:filename})
      var that = item;
        bootbox.confirm("Are you sure you want to delete this image?", function(result) {
          if(result){
               $.get(base.options.site_url+'/submit/uploadfile_delete',data,function(data){
                   var meta_check = base.images[filename].metaData;
                   delete base.images[filename];
                   base.delete_meta(meta_check);
                   if(data.error){
                      bootbox.alert(data.message)
                   }else{
                      that.parent().fadeOut('slow');
                   }
              });
          }
        });
    }
    base.delete_meta = function(data){
        var checker;
        var metadata = data;
        /////////////////////////////////////////////////////////////////////////
        var description =  base.if_contain_tags(metadata,'Exif.Image.ImageDescription');
        if(description){
          checker = base.findIndex(base.meta.descriptions,description)
          if(typeof checker  === 'number' ){
            base.meta.descriptions.splice(checker, 1);
          }
        }
        /////////////////////////////////////////////////////////////////////////
        var keywords =  base.if_contain_tags(metadata,'Exif.Photo.UserComment');
        if(keywords){
          checker = base.if_has_it(base.meta.keywords,keywords)
          if(checker){
            base.meta.keywords.splice(checker, 1);
          }
        }
        /////////////////////////////////////////////////////////////////////////
        var copyright =  base.if_contain_tags(metadata,'Exif.Image.Copyright');
        if(copyright){
          checker = base.if_has_it(base.meta.copyrights,copyright)
          if(checker){
            base.meta.copyrights.splice(checker, 1);
          }
        }
        ////////////////////////////////////////////////////////////////////////
        var date = base.if_contain_tags(metadata,'Exif.Photo.DateTimeOriginal');
        ////////////////////////////////////////////////////////////////////////
        var aurthor = base.if_contain_tags(metadata,'Exif.Image.Artist');
        if(aurthor){
          checker = base.findIndex(base.meta.aurthors,aurthor)
          if(typeof checker  === 'number' ){
            base.meta.aurthors.splice(checker, 1);
          }
        }
        
        $('[name=DEMOPIC_PHOTOG]').val('')
        if(base.meta.aurthors.length > 0){
          $('[name=DEMOPIC_PHOTOG]').val(base.meta.aurthors.join('\n'));
        }
        $('[name=DEMOPIC_DESCR]').val('')
        if(base.meta.descriptions.length == 1){
         $('[name=DEMOPIC_DESCR]').val(base.meta.descriptions[0]);
        }
        $('[name=DEMOPIC_KW]').val('')
        if(base.meta.keywords.length > 1){
          $('[name=DEMOPIC_KW]').val(base.meta.keywords.join('\n'));
        } 
        $.each(base.images,function(){
            base.check_for_metadata(this.metaData);
        })
    }
    base.check_for_metadata = function(data){
          var checker;
          var metadata = data;
          // Parse exif
          /////////////////////////////////////////////////////////////////////////
          var description =  base.if_contain_tags(metadata,'Exif.Image.ImageDescription');
          if(description){
            checker = base.if_has_it(base.meta.descriptions,description)
            if(!checker){
              base.meta.descriptions.push(description);
            }
          }
          /////////////////////////////////////////////////////////////////////////
          var keywords =  base.if_contain_tags(metadata,'Exif.Photo.UserComment');
          if(keywords){
            checker = base.if_has_it(base.meta.keywords,keywords)
            if(!checker){
              base.meta.keywords.push(keywords);
            }
          }
          /////////////////////////////////////////////////////////////////////////
          var copyright =  base.if_contain_tags(metadata,'Exif.Image.Copyright');
          if(copyright){
            checker = base.if_has_it(base.meta.copyrights,copyright)
            if(!checker){
              base.meta.copyrights.push(copyright);
            }
          }
          ////////////////////////////////////////////////////////////////////////
          var date = base.if_contain_tags(metadata,'Exif.Photo.DateTimeOriginal');
          var aurthor = base.if_contain_tags(metadata,'Exif.Image.Artist');
          if(aurthor){
            checker = base.if_has_it(base.meta.aurthors,aurthor)
            if(!checker){
              base.meta.aurthors.push(aurthor);
            }else{
              var index = base.findIndex(base.meta.aurthors,aurthor)
            }
          }
          // Data manipulation
          $('[name=DEMOPIC_PHOTOG]').val('')
          if(base.meta.aurthors.length > 0){
              $('[name=DEMOPIC_PHOTOG]').val(base.meta.aurthors.join('\n'));
          }
          $('[name=DEMOPIC_DESCR]').val('')
          if(base.meta.descriptions.length == 1){
              $('[name=DEMOPIC_DESCR]').val(base.meta.descriptions[0]);
          }
          $('[name=DEMOPIC_KW]').val('')
          if(base.meta.keywords.length > 1){
              $('[name=DEMOPIC_KW]').val(base.meta.keywords.join('\n'));
          }

    }
    base.loadUploader = function(container,select){
           var ur = new plupload.Uploader({
		        runtimes : 'html5',
            		drop_element : select,
		        browse_button : select,
		        container : container,
		        max_file_size : '10mb',
		        url : '/submit/uploadfile_new',
		        filters : [
			        {title : "Image files", extensions : "jpg,gif,png"},
			      ],
		        multipart_params:base.options.formData
            });
            ur.bind('Init', function(up, params) {
        	if (ur.features.dragdrop) {
          		var target = select;
          
          		target.ondragover = function(event) {
            			event.dataTransfer.dropEffect = "copy";
          		};
          
          		target.ondragenter = function() {
            			this.className = "dragover";
          		};
          
          		target.ondragleave = function() {
            			this.className = "";
          		};
          
         	 	target.ondrop = function() {
           	 		this.className = "";
         	 	};
            	}
      	   });
 
            ur.init();
            
            ur.bind('FilesAdded', function(up, files) {
        		$.each(files, function(i, file) {

				$('#filelist').append(
        				'<div class="previewer" id="' + file.id + '"><div class="thumbnail"><div class="progress"><div class="bar" style="width: 0%;"></div></div></div>' +
        			'</div>');
        		});
                ur.start();
        		up.refresh(); 
        	});

	        ur.bind('UploadProgress', function(up, file) {
		        $('#' + file.id + " .bar").css('width',file.percent+'%');
	        });

        	ur.bind('Error', function(up, err) {
        		$('#filelist').append("<div>Error: " + err.code +
        			", Message: " + err.message +
        			(err.file ? ", File: " + err.file.name : "") +
        			"</div>"
        		);
              up.refresh(); 
        	});

        	ur.bind('FileUploaded', function(up, file,response) {
                  var json = $.parseJSON(response.response);
                  $('#' + file.id + " b").remove();
                  base.check_for_metadata($.parseJSON(json.file.metadata));
                  
                  var split = file.name.split('.')
                  var url = base.options.site_url+'/submit/getuploadedfile?indir='+base.options.formData.indir+'&doctype='+base.options.formData.doctype+'&access='+base.options.formData.access+'&icon=1&key=file&filename='+split[0]+'.gif'
                  var sd = new image(file.name,url,$.parseJSON(json.file.metadata));
                  base.images[file.name] = sd;
                  
                  var to_render = {
                      image:url,
                      filename:file.name,
                      file_id:file.id,
                      description:sd.getMetaDescription()
                  }
                  
                  var output = Mustache.to_html(base.options.template, to_render);
                  $('#'+file.id).html(output)
                 
          });
        };
        base.init();
    };
    $.theUploader.defaultOptions = {
        type:'photo',
        multiple:'true',
        maxFileSize: '3000',
        title: 'Uploader',
        hasPopup: false,
template: "<div data-id='{{filename}}'' class='thumbnail'><a href='javascript:void(0)' class='remove_image' data-id='{{filename}}'><i class='icon-remove'></i></a><img class='imageIcon' src='{{image}}' /><div style='clear:both'></div><form class='preview-form'><div class='form-control'><label>Title</label><input type='text' name='image_title' class='image_title' value=''/></div><div class='form-control'><label>Caption</label><textarea name='image_description' class='image_description'>{{description}}</textarea></div></form><div style='clear:both'></div><div class='cover'><label class='checkbox'><input type='checkbox' name='cover' value='1' /> Make it cover photo of the album?</label></div></div>" };
    $.fn.theUploader = function(type, options){
        return this.each(function(){
            (new $.theUploader(this, type, options));
        });
    };
    $.fn.gettheUploader = function(){
        this.data("theUploader");
    };
    
})(jQuery);


