json.extract! respuestum, :id, :nombre, :correo, :descripcion, :created_at, :updated_at
json.url respuestum_url(respuestum, format: :json)
