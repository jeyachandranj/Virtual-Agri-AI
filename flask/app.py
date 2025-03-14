from flask import Flask, request, jsonify, render_template
import requests
from bs4 import BeautifulSoup
from datetime import datetime, timedelta
import pandas as pd
from flask_cors import CORS
import base64
import os
from groq import Groq
import json

app = Flask(__name__)

STATE_CODES = {
    "AN": "Andaman and Nicobar",
    "AP": "Andhra Pradesh",
    "AR": "Arunachal Pradesh",
    "AS": "Assam",
    "BI": "Bihar",
    "CH": "Chandigarh",
    "CG": "Chattisgarh",
    "DN": "Dadra and Nagar Haveli",
    "DD": "Daman and Diu",
    "GO": "Goa",
    "GJ": "Gujarat",
    "HR": "Haryana",
    "HP": "Himachal Pradesh",
    "JK": "Jammu and Kashmir",
    "JR": "Jharkhand",
    "KK": "Karnataka",
    "KL": "Kerala",
    "LD": "Lakshadweep",
    "MP": "Madhya Pradesh",
    "MH": "Maharashtra",
    "MN": "Manipur",
    "MG": "Meghalaya",
    "MZ": "Mizoram",
    "NG": "Nagaland",
    "DL": "NCT of Delhi",
    "OR": "Odisha",
    "PC": "Pondicherry",
    "PB": "Punjab",
    "RJ": "Rajasthan",
    "SK": "Sikkim",
    "TN": "Tamil Nadu",
    "TL": "Telangana",
    "TR": "Tripura",
    "UP": "Uttar Pradesh",
    "UC": "Uttrakhand",
    "WB": "West Bengal"
}

DISTRICT_CODES= { '30': 'Ariyalur', '32': 'Chengalpattu', '15': 'Chennai', '1': 'Coimbatore', '2': 'Cuddalore', '12': 'Dharmapuri', '13': 'Dindigul', '3': 'Erode', '33': 'Kallakuruchi', '4': 'Kancheepuram', '14': 'Karur', '31': 'Krishnagiri', '5': 'Madurai', '38': 'Mayiladuthurai', '16': 'Nagapattinam', '17': 'Nagercoil (Kannyiakumari)', '18': 'Namakkal', '6': 'Perambalur', '20': 'Pudukkottai', '21': 'Ramanathapuram', '34': 'Ranipet', '22': 'Salem', '23': 'Sivaganga', '35': 'Tenkasi', '7': 'Thanjavur', '19': 'The Nilgiris', '24': 'Theni', '25': 'Thiruchirappalli', '26': 'Thirunelveli', '36': 'Thirupathur', '37': 'Thirupur', '8': 'Thiruvannamalai', '9': 'Thiruvarur', '27': 'Thiruvellore', '28': 'Tuticorin', '29': 'Vellore', '10': 'Villupuram', '11': 'Virudhunagar'}
COMMODITY_CODES = {'451': 'Absinthe', '137': 'Ajwan', '281': 'Alasande Gram', '325': 'Almond(Badam)', '166': 'Alsandikai', '86': 'Amaranthus', '130': 'Ambada Seed', '417': 'Ambady/Mesta', '355': 'Amla(Nelli Kai)', '102': 'Amphophalus', '419': 'Amranthas Red', '209': 'Antawala', '379': 'Anthorium', '17': 'Apple', '326': 'Apricot(Jardalu/Khumani)', '140': 'Arecanut(Betelnut/Supari)', '49': 'Arhar (Tur/Red Gram)(Whole)', '260': 'Arhar Dal(Tur Dal)', '444': 'Asalia', '505': 'Asgand', '83': 'Ashgourd', '506': 'Ashoka', '443': 'Ashwagandha', '434': 'Asparagus', '232': 'Astera', '507': 'Atis', '269': 'Avare Dal', '418': 'Bael', '491': 'Bajji chilli', '28': 'Bajra(Pearl Millet/Cumbu)', '274': 'Balekai', '482': 'balsam', '204': 'Bamboo', '19': 'Banana', '90': 'Banana - Green', '483': 'Banana flower', '485': 'Banana Leaf', '484': 'Banana stem', '29': 'Barley (Jau)', '435': 'basil', '321': 'Bay leaf (Tejpatta)', '94': 'Beans', '262': 'Beaten Rice', '157': 'Beetroot', '508': 'Behada', '263': 'Bengal Gram Dal (Chana Dal)', '6': 'Bengal Gram(Gram)(Whole)', '357': 'Ber(Zizyphus/Borehannu)', '143': 'Betal Leaves', '41': 'Betelnuts', '85': 'Bhindi(Ladies Finger)', '448': 'Bhui Amlaya', '113': 'Big Gram', '51': 'Binoula', '81': 'Bitter gourd', '8': 'Black Gram (Urd Beans)(Whole)', '264': 'Black Gram Dal (Urd Dal)', '38': 'Black pepper', '380': 'BOP', '189': 'Borehannu', '82': 'Bottle gourd', '449': 'Brahmi', '290': 'Bran', '497': 'Bread Fruit', '35': 'Brinjal', '487': 'Brocoli', '293': 'Broken Rice', '320': 'Broomstick(Flower Broom)', '214': 'Bull', '284': 'Bullar', '224': 'Bunch Beans', '272': 'Butter', '416': 'buttery', '154': 'Cabbage', '480': 'Calendula', '215': 'Calf', '354': 'Camel Hair', '205': 'Cane', '164': 'Capsicum', '40': 'Cardamoms', '375': 'Carnation', '153': 'Carrot', '238': 'Cashew Kernnel', '36': 'Cashewnuts', '270': 'Castor Oil', '123': 'Castor Seed', '34': 'Cauliflower', '188': 'Chakotha', '438': 'Chandrashoor', '169': 'Chapparad Avare', '241': 'Chennangi (Whole)', '295': 'Chennangi Dal', '328': 'Cherry', '71': 'Chikoos(Sapota)', '26': 'Chili Red', '88': 'Chilly Capsicum', '509': 'Chironji', '167': 'Chow Chow', '402': 'Chrysanthemum', '231': 'Chrysanthemum(Loose)', '316': 'Cinamon(Dalchini)', '467': 'cineraria', '478': 'Clarkia', '105': 'Cloves', '80': 'Cluster beans', '315': 'Coca', '368': 'Cock', '104': 'Cocoa', '138': 'Coconut', '266': 'Coconut Oil', '112': 'Coconut Seed', '45': 'Coffee', '318': 'Colacasia', '129': 'Copra', '43': 'Coriander(Leaves)', '108': 'Corriander seed', '472': 'Cossandra', '15': 'Cotton', '99': 'Cotton Seed', '212': 'Cow', '92': 'Cowpea (Lobia/Karamani)', '89': 'Cowpea(Veg)', '159': 'Cucumbar(Kheera)', '42': 'Cummin Seed(Jeera)', '486': 'Curry Leaf', '352': 'Custard Apple (Sharifa)', '382': 'Daila(Chandni)', '91': 'Dal (Avare)', '273': 'Dalda', '410': 'Delha', '69': 'Dhaincha', '442': 'dhawai flowers', '476': 'dianthus', '492': 'Double Beans', '495': 'Dragon fruit', '423': 'dried mango', '168': 'Drumstick', '132': 'Dry Chillies', '345': 'Dry Fodder', '278': 'Dry Grapes', '370': 'Duck', '163': 'Duster Beans', '367': 'Egg', '361': 'Egypian Clover(Barseem)', '296': 'Elephant Yam (Suran)', '64': 'Field Pea', '221': 'Fig(Anjura/Anjeer)', '206': 'Firewood', '366': 'Fish', '510': 'Flax seeds', '365': 'Flower Broom', '121': 'Foxtail Millet(Navane)', '298': 'French Beans (Frasbean)', '350': 'Galgal(Lemon)', '471': 'Gamphrena', '25': 'Garlic', '249': 'Ghee', '452': 'Giloy', '276': 'Gingelly Oil', '27': 'Ginger(Dry)', '103': 'Ginger(Green)', '364': 'Gladiolus Bulb', '363': 'Gladiolus Cut Flower', '462': 'Glardia', '219': 'Goat', '353': 'Goat Hair', '475': 'golden rod', '511': 'Gond', '494': 'Goose berry (Nellikkai)', '359': 'Gram Raw(Chholia)', '294': 'Gramflour', '22': 'Grapes', '165': 'Green Avare (W)', '87': 'Green Chilli', '346': 'Green Fodder', '9': 'Green Gram (Moong)(Whole)', '265': 'Green Gram Dal (Moong Dal)', '50': 'Green Peas', '267': 'Ground Nut Oil', '268': 'Ground Nut Seed', '10': 'Groundnut', '314': 'Groundnut (Split)', '312': 'Groundnut pods (raw)', '75': 'Guar', '413': 'Guar Seed(Cluster Beans Seed)', '185': 'Guava', '453': 'Gudmar', '454': 'Guggal', '461': 'gulli', '74': 'Gur(Jaggery)', '279': 'Gurellu', '469': 'gypsophila', '252': 'Haralekai', '512': 'Harrah', '216': 'He Buffalo', '474': 'Heliconia species', '369': 'Hen', '125': 'Hippe Seed', '236': 'Honey', '124': 'Honge seed', '119': 'Hybrid Cumbu', '473': 'hydrangea', '299': 'Indian Beans (Seam)', '344': 'Indian Colza(Sarson)', '465': 'Irish', '256': 'Isabgul (Psyllium)', '182': 'Jack Fruit', '513': 'Jaee', '406': 'Jaffri', '151': 'Jaggery', '175': 'Jamamkhan', '184': 'Jamun(Narale Hannu)', '376': 'Jarbara', '229': 'Jasmine', '250': 'Javi', '5': 'Jowar(Sorghum)', '16': 'Jute', '210': 'Jute Seed', '362': 'Kabuli Chana(Chickpeas-White)', '317': 'Kacholam', '230': 'Kakada', '501': 'kakatan', '456': 'Kalihari', '457': 'Kalmegh', '233': 'Kankambra', '115': 'Karamani', '439': 'karanja seeds', '187': 'Karbuja(Musk Melon)', '305': 'Kartali (Kantola)', '481': 'Kevda', '61': 'Kharif Mash', '514': 'Khirni', '372': 'Khoya', '336': 'Kinnow', '177': 'Knool Khol', '117': 'Kodo Millet(Varagu)', '458': 'kokum', '459': 'Kooth', '243': 'Kuchur', '114': 'Kulthi(Horse Gram)', '415': 'Kutki', '426': 'kutki', '155': 'Ladies Finger', '515': 'Laha', '96': 'Lak(Teora)', '171': 'Leafy Vegetable', '310': 'Lemon', '63': 'Lentil (Masur)(Whole)', '378': 'Lilly', '180': 'Lime', '470': 'Limonia (status)', '67': 'Linseed', '280': 'Lint', '432': 'liquor turmeric', '351': 'Litchi', '302': 'Little gourd (Kundru)', '304': 'Long Melon(Kakri)', '403': 'Lotus', '339': 'Lotus Sticks', '337': 'Lukad', '479': 'Lupine', '504': 'Ma.Inji', '107': 'Mace', '427': 'macoy', '411': 'Mahedi', '335': 'Mahua', '371': 'Mahua Seed(Hippe seed)', '288': 'Maida Atta', '4': 'Maize', '20': 'Mango', '172': 'Mango (Raw-Ripe)', '422': 'mango powder', '225': 'Maragensu', '181': 'Marasebu', '407': 'Marget', '235': 'Marigold(Calcutta)', '405': 'Marigold(loose)', '502': 'Marikozhunthu', '60': 'Mash', '340': 'Mashrooms', '259': 'Masur Dal', '93': 'Mataki', '47': 'Methi Seeds', '46': 'Methi(Leaves)', '237': 'Millets', '360': 'Mint(Pudina)', '258': 'Moath Dal', '95': 'Moath Dal', '77': 'Mousambi(Sweet Lime)', '446': 'Muesli', '428': 'Muleti', '516': 'Muskmelon Seeds', '12': 'Mustard', '324': 'Mustard Oil', '142': 'Myrobolan(Harad)', '245': 'Nargasi', '222': 'Nearle Hannu', '126': 'Neem Seed', '223': 'Nelli Kai', '500': 'Nerium', '445': 'nigella seeds', '424': 'nigella seeds', '98': 'Niger Seed (Ramtil)', '106': 'Nutmeg', '23': 'Onion', '358': 'Onion Green', '18': 'Orange', '381': 'Orchid', '420': 'Other green and fresh vegetables', '97': 'Other Pulses', '213': 'Ox', '414': 'Paddy(Dhan)(Basmati)', '2': 'Paddy(Dhan)(Common)', '441': 'Palash flowers', '72': 'Papaya', '313': 'Papaya (Raw)', '404': 'Patti Calcutta', '331': 'Peach', '330': 'Pear(Marasebu)', '308': 'Peas cod', '174': 'Peas Wet', '347': 'Peas(Dry)', '301': 'Pegeon Pea (Arhar Fali)', '109': 'Pepper garbled', '110': 'Pepper ungarbled', '489': 'Perandai', '327': 'Persimon(Japani Fal)', '220': 'Pigs', '21': 'Pineapple', '431': 'pippali', '329': 'Plum', '303': 'Pointed gourd (Parval)', '240': 'Polherb', '190': 'Pomegranate', '425': 'Poppy capsules', '421': 'poppy seeds', '24': 'Potato', '84': 'Pumpkin', '254': 'Pundi', '128': 'Pundi Seed', '447': 'Pupadia', '161': 'Raddish', '30': 'Ragi (Finger Millet)', '409': 'Raibel', '248': 'Rajgir', '517': 'Rala', '282': 'Ram', '518': 'Ramphal', '307': 'Rat Tail Radish (Mogari)', '460': 'Ratanjot', '65': 'Raya', '519': 'Rayee', '493': 'Red Cabbage', '7': 'Red Gram', '322': 'Resinwood', '62': 'Riccbcan', '3': 'Rice', '160': 'Ridgeguard(Tori)', '374': 'Rose(Local)', '228': 'Rose(Loose))', '373': 'Rose(Tata)', '306': 'Round gourd', '111': 'Rubber', '291': 'Sabu Dan', '59': 'Safflower', '338': 'Saffron', '271': 'Sajje', '468': 'salvia', '122': 'Same/Savi', '433': 'sanay', '450': 'Sandalwood', '247': 'Sarasum', '277': 'Season Leaves', '253': 'Seegu', '176': 'Seemebadnekai', '201': 'Seetapal', '11': 'Sesamum(Sesame,Gingelly,Til)', '464': 'sevanti', '217': 'She Buffalo', '283': 'She Goat', '218': 'Sheep', '183': 'Siddota', '490': 'Siru Kizhagu', '226': 'Skin And Hide', '156': 'Snakeguard', '135': 'Soanf', '207': 'Soapnut(Antawala/Retha)', '520': 'Soha', '286': 'Soji', '246': 'Sompu', '13': 'Soyabean', '455': 'spikenard', '342': 'Spinach', '311': 'Sponge gourd', '332': 'Squash(Chappal Kadoo)', '440': 'stevia', '430': 'stone pulverizer', '48': 'Sugar', '150': 'Sugarcane', '488': 'Sundaikai', '14': 'Sunflower', '285': 'Sunflower Seed', '139': 'Sunhemp', '242': 'Suram', '300': 'Surat Beans (Papadi)', '255': 'Suva (Dill Seed)', '178': 'Suvarna Gadde', '152': 'Sweet Potato', '173': 'Sweet Pumpkin', '466': 'Sweet Sultan', '477': 'sweet william', '120': 'T.V. Cumbu', '261': 'Tamarind Fruit', '208': 'Tamarind Seed', '100': 'Tapioca', '76': 'Taramira', '44': 'Tea', '200': 'Tender Coconut', '116': 'Thinai (Italian Millet)', '170': 'Thogrikai', '162': 'Thondekai', '349': 'Tinda', '141': 'Tobacco', '78': 'Tomato', '323': 'Torchwood', '66': 'Toria', '234': 'Tube Flower', '401': 'Tube Rose(Double)', '408': 'Tube Rose(Loose)', '377': 'Tube Rose(Single)', '503': 'Tulasi', '463': 'tulip', '39': 'Turmeric', '309': 'Turmeric (raw)', '341': 'Turnip', '436': 'vadang', '437': 'Vatsanabha', '343': 'Walnut', '496': 'Water Apple', '521': 'Water chestnut', '73': 'Water Melon', '522': 'Wax', '1': 'Wheat', '287': 'Wheat Atta', '429': 'White Muesli', '412': 'White Peas', '158': 'White Pumpkin', '498': 'Wild lemon', '203': 'Wood', '499': 'Wood Apple', '348': 'Wool', '244': 'Yam', '297': 'Yam (Ratalu)'}

def get_code_by_name(codes_dict, name):
    """Find code by name (case-insensitive)"""
    for code, item_name in codes_dict.items():
        if item_name.lower() == name.lower():
            return code
    return None

CORS(app)

def get_name_by_code(codes_dict, code):
    """Find name by code"""
    return codes_dict.get(code)



#
GROQ_API_KEY = "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"

# Initialize Groq client
client = Groq(api_key=GROQ_API_KEY)

@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/api/detect-disease', methods=['POST'])
def detect_disease():
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400
    
    file = request.files['image']
    
    # Read and encode the image
    image_bytes = file.read()
    base64_image = base64.b64encode(image_bytes).decode('utf-8')
    
    try:
        # Call Groq API with the updated prompt
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": "Identify the plant/crop in this image, the specific disease affecting it, provide a treatment solution, recommend pesticides, and explain why these pesticides are effective. Format your answer as: 'PLANT: [plant name], DISEASE: [disease name], SOLUTION: [treatment solution], PESTICIDES: [recommended pesticides], EXPLANATION: [why these pesticides are effective]'"
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}",
                            },
                        },
                    ],
                }
            ],
            model="llama-3.2-11b-vision-preview",
        )
        
        # Extract the response
        response = chat_completion.choices[0].message.content
        
        # Parse the response to extract all required information
        try:
            plant = response.split('PLANT:')[1].split('DISEASE:')[0].strip() if 'PLANT:' in response else ''
            disease = response.split('DISEASE:')[1].split('SOLUTION:')[0].strip() if 'DISEASE:' in response else ''
            solution = response.split('SOLUTION:')[1].split('PESTICIDES:')[0].strip() if 'SOLUTION:' in response else ''
            pesticides = response.split('PESTICIDES:')[1].split('EXPLANATION:')[0].strip() if 'PESTICIDES:' in response else ''
            explanation = response.split('EXPLANATION:')[1].strip() if 'EXPLANATION:' in response else ''
            
            return jsonify({
                'success': True,
                'plant': plant,
                'disease': disease,
                'solution': solution,
                'pesticides': pesticides,
                'explanation': explanation,
                'full_response': response
            })
        except:
            # If parsing fails, return the raw response
            return jsonify({
                'success': True,
                'full_response': response
            })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/market-prices', methods=['GET'])
def get_market_prices():
    try:
        # Get parameters from request
        state = request.args.get('state')
        district = request.args.get('district')
        commodity = request.args.get('commodity', 'Tomato')  # Default to Tomato if not specified
        
        # Date handling (default: today to 7 days ago)
        today = datetime.now()
        one_week_ago = today - timedelta(days=7)
        
        # Format: DD-MMM-YYYY (e.g., 01-Mar-2024)
        default_date_from = one_week_ago.strftime("%d-%b-%Y")
        default_date_to = today.strftime("%d-%b-%Y")
        
        date_from = request.args.get('date_from', default_date_from)
        date_to = request.args.get('date_to', default_date_to)
        
        # Validate inputs
        if not state:
            return jsonify({"error": "State parameter is required"}), 400
        
        if not district:
            return jsonify({"error": "District parameter is required"}), 400
        
        # Get codes
        state_code = get_code_by_name(STATE_CODES, state)
        if not state_code:
            return jsonify({"error": f"Invalid state name: {state}"}), 400
        
        district_code = get_code_by_name(DISTRICT_CODES, district)
        if not district_code:
            return jsonify({"error": f"Invalid district name: {district}"}), 400
        
        commodity_code = get_code_by_name(COMMODITY_CODES, commodity)
        if not commodity_code:
            return jsonify({"error": f"Invalid commodity name: {commodity}"}), 400
        
        # Construct URL
        url = f"https://agmarknet.gov.in/SearchCmmMkt.aspx?Tx_Commodity={commodity_code}&Tx_State={state_code}&Tx_District={district_code}&Tx_Market=0&DateFrom={date_from}&DateTo={date_to}&Fr_Date={date_from}&To_Date={date_to}&Tx_Trend=0&Tx_CommodityHead={commodity}&Tx_StateHead={state}&Tx_DistrictHead={district}"
        
        # Send HTTP request
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        
        response = requests.get(url, headers=headers)
        
        # Check response
        if response.status_code != 200:
            return jsonify({
                "error": f"Failed to fetch data from AgMarkNet. Status code: {response.status_code}"
            }), 500
        
        # Parse HTML
        soup = BeautifulSoup(response.text, "html.parser")
        table = soup.find("table", {"id": "cphBody_GridPriceData"})
        
        if not table:
            return jsonify({
                "message": "No data found",
                "parameters": {
                    "state": state,
                    "district": district,
                    "commodity": commodity,
                    "date_from": date_from,
                    "date_to": date_to
                }
            }), 404
        
        # Extract data
        data = []
        rows = table.find_all("tr")[1:]  # Skip header row
        
        for row in rows:
            cols = row.find_all("td")
            if len(cols) >= 10:  # Ensure it has all expected columns
                # Parse date
                date_str = cols[9].text.strip()
                try:
                    date_obj = datetime.strptime(date_str, "%d/%m/%Y")
                    date_formatted = date_obj.strftime("%Y-%m-%d")
                except:
                    date_formatted = date_str
                    
                data.append({
                    "district": cols[1].text.strip(),
                    "market": cols[2].text.strip(),
                    "commodity": cols[3].text.strip(),
                    "variety": cols[4].text.strip(),
                    "grade": cols[5].text.strip(),
                    "min_price": cols[6].text.strip(),
                    "max_price": cols[7].text.strip(),
                    "modal_price": cols[8].text.strip(),
                    "date": date_formatted,
                })
        
        if not data:
            return jsonify({
                "message": "No price data found for this period",
                "parameters": {
                    "state": state,
                    "district": district,
                    "commodity": commodity,
                    "date_from": date_from,
                    "date_to": date_to
                }
            }), 404
        
        # Convert to DataFrame for processing
        df = pd.DataFrame(data)
        
        # Sort by date (newest first)
        df['date'] = pd.to_datetime(df['date'])
        df = df.sort_values('date', ascending=False)
        
        # Group by market and get most recent entry for each
        latest_prices = df.groupby('market').first().reset_index()
        
        # Convert dates back to string for JSON serialization
        latest_prices['date'] = latest_prices['date'].dt.strftime('%Y-%m-%d')
        
        return jsonify({
            "status": "success",
            "parameters": {
                "state": state,
                "district": district,
                "commodity": commodity,
                "date_from": date_from,
                "date_to": date_to
            },
            "data": latest_prices.to_dict('records')
        })
    
    except Exception as e:
        return jsonify({
            "error": f"An error occurred: {str(e)}"
        }), 500

# Helper route to get available states
@app.route('/api/states', methods=['GET'])
def get_states():
    return jsonify({
        "states": [{"code": code, "name": name} for code, name in STATE_CODES.items()]
    })

# Helper route to get available districts
@app.route('/api/districts', methods=['GET'])
def get_districts():
    state_code = request.args.get('state_code')
    if state_code:
        # In a real implementation, you would filter districts by state
        # For simplicity, we're returning all districts here
        pass
    
    return jsonify({
        "districts": [{"code": code, "name": name} for code, name in DISTRICT_CODES.items()]
    })

# Helper route to get available commodities
@app.route('/api/commodities', methods=['GET'])
def get_commodities():
    return jsonify({
        "commodities": [{"code": code, "name": name} for code, name in COMMODITY_CODES.items()]
    })

if __name__ == '__main__':
    app.run(debug=True)
    CORS(app) 





