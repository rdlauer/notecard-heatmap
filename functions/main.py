from google.cloud import firestore


def add_data(request):
    request_json = request.get_json()
    db = firestore.Client()
    db.collection(u'mapdata').document().set(request_json)
    return '', 200
