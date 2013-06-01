
# Resumable Uploads in the Google Data Protocol

[Google Data Protocol Uploads](https://developers.google.com/gdata/docs/resumable_upload)

Initiating a resumable upload request:

    POST /upload HTTP/1.1
    Host: example.com
    Authorization: <authorization header>
    Content-Length: <content length>
    Content-Type: application/json

    {
        "type": "image/png",
        "length": <length in bytes>,
        "title": "myimage.png"
    }

    HTTP/1.1 200 OK

    {
        "url": <upload url> // /upload/guid
    }


Uploading a file:

    PUT <upload url> HTTP/1.1
    Host: example.com
    Content-Length: 100000
    Content-Type: application/png
    Content-Range: bytes 0-99999/1234567

    <bytes 0-99999>


    HTTP/1.1 308 Resume Incomplete
    Content-Length: 0
    Range: 0-99999

    // upload completed
    HTTP/1.1 201 Created

Resuming an upload:

    PUT <upload_uri> HTTP/1.1
    Host: example.com
    Content-Length: 0
    Content-Range: bytes */100

    HTTP/1.1 308 Resume Incomplete
    Content-Length: 0
    Range: 0-42

    PUT <upload_uri> HTTP/1.1
    Host: example.com
    Content-Length: 57
    Content-Range: 43-99/100

   <bytes 43-99>
